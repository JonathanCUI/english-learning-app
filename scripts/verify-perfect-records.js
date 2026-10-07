const assert = require('assert');
const records = require('../miniprogram/utils/perfect-records.js');
const createPageConfig = require('../miniprogram/pages/index/page-config.js');
const vocabulary = require('../miniprogram/data/vocabulary.js');

module.exports = function verifyPerfectRecords() {
  const key = records.key('grade1', '上学期', 'unit1', 'quiz');
  const run = () => ({ key, total: 12, startedAt: 1000 });
  const first = records.settle({}, run(), 12, 12, 11000);
  assert.strictEqual(first.reward, 0);
  assert.strictEqual(first.records[key].ms, 10000);
  assert.strictEqual(records.settle(first.records, run(), 11, 12, 2000), null);
  assert.strictEqual(records.settle(first.records, run(), 0, 0, 2000), null);
  assert.strictEqual(records.settle(first.records, run(), 12, 12, 500), null);
  assert.strictEqual(records.settle(first.records, run(), 12, 12, 11000).changed, false);
  assert.strictEqual(records.settle(first.records, run(), 12, 12, 21000).changed, false);
  const attempt = run();
  attempt.endedAt = 6000;
  const faster = records.settle(first.records, attempt, 12, 12, 20000);
  assert.strictEqual(faster.reward, 50);
  assert.strictEqual(faster.ms, 5000, '最后作答后的朗读等待不应计时');
  assert.strictEqual(records.settle(first.records, attempt, 12, 12, 20000), null, '同一轮只能结算一次');
  assert.strictEqual(records.settle(first.records, { ...run(), total: 13 }, 13, 13, 4000).reward, 0, '题量改变应重新建立纪录');

  const originalWx = global.wx;
  const originalNow = Date.now;
  const storage = {};
  global.wx = {
    getStorageSync: (name) => storage[name],
    setStorageSync: (name, value) => { storage[name] = JSON.parse(JSON.stringify(value)); },
    showToast() {}
  };
  Date.now = () => 1000;
  const page = () => {
    const config = createPageConfig();
    config.data = JSON.parse(JSON.stringify(config.data));
    config.setData = function (values, callback) { Object.assign(this.data, values); if (callback) callback(); };
    Object.assign(config.data, {
      selectedGrade: 'grade1', selectedSemester: '上学期', selectedUnit: 'unit1',
      currentWords: vocabulary.grade1['上学期'].unit1
    });
    return config;
  };
  try {
    const p = page();
    const total = p.data.currentWords.length;
    const finish = (mode, ms, score = total) => {
      mode === 'quiz' ? p.beginQuiz() : p.beginSpelling();
      p._timedRun.endedAt = 1000 + ms;
      p.finishActivity('完成', score, total);
    };
    finish('quiz', 10000);
    assert.strictEqual(p.data.coins, 0);
    assert.ok(p.data.quizRecordLabel.includes('10.0秒'));
    finish('quiz', 5000);
    assert.strictEqual(p.data.coins, 50);
    p.finishActivity('完成', total, total);
    assert.strictEqual(p.data.coins, 50);
    finish('quiz', 5000);
    finish('quiz', 1000, total - 1);
    assert.strictEqual(p.data.coins, 50);
    finish('spelling', 6000);
    assert.strictEqual(p.data.coins, 50, '不同模式应单独建立纪录');
    finish('spelling', 4000);
    assert.strictEqual(p.data.coins, 100);
    p.addCoins(1);
    const reloaded = page();
    reloaded.refreshRecordLabels();
    assert.ok(reloaded.data.quizRecordLabel.includes('5.0秒'));
    assert.ok(reloaded.data.spellingRecordLabel.includes('4.0秒'));
    assert.strictEqual(storage.starlightEconomyV1.coins, 101);
    reloaded.data.selectedUnit = 'unit2';
    reloaded.refreshRecordLabels();
    assert.ok(reloaded.data.quizRecordLabel.includes('暂无纪录'));
    reloaded.data.selectedUnit = '';
    reloaded.refreshRecordLabels();
    assert.strictEqual(reloaded.data.quizRecordLabel, '选好单元查看纪录');
  } finally {
    Date.now = originalNow;
    global.wx = originalWx;
  }
  console.log('全对计时、分单元纪录、本地恢复及破纪录 +50 奖励检查通过');
};
