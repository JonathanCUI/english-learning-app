const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const miniRoot = path.join(root, 'miniprogram');
const vocabulary = require(path.join(miniRoot, 'data', 'vocabulary.js'));
const atlas = require(path.join(miniRoot, 'data', 'atlas.js'));
const shop = require(path.join(miniRoot, 'data', 'shop.js'));
const speechMap = require(path.join(miniRoot, 'data', 'audio.js'));
const game = require(path.join(miniRoot, 'utils', 'game.js'));
const createPageConfig = require(path.join(miniRoot, 'pages', 'index', 'page-config.js'));
const semesters = ['上学期', '下学期'];
let wordCount = 0;
let unitCount = 0;
let missingAudioCount = 0;
const allowMissing = process.argv.includes('--allow-missing');

JSON.parse(fs.readFileSync(path.join(root, 'project.config.json'), 'utf8'));
const appConfig = JSON.parse(fs.readFileSync(path.join(miniRoot, 'app.json'), 'utf8'));
JSON.parse(fs.readFileSync(path.join(miniRoot, 'sitemap.json'), 'utf8'));

Object.keys(vocabulary).forEach((grade) => {
  Object.keys(vocabulary[grade]).forEach((semester) => {
    for (const unit of Object.keys(vocabulary[grade][semester])) {
      unitCount += 1;
      const words = vocabulary[grade][semester][unit];
      if (!Array.isArray(words) || words.length === 0) throw new Error('缺少词汇：' + [grade, semester, unit].join('/'));
      const speechScope = speechMap[[grade, semester, unit].join('|')];
      if (!speechScope) throw new Error('缺少语音单元映射：' + [grade, semester, unit].join('/'));
      const enriched = atlas.enrichWords(words, grade, semester, unit);
      if (enriched.some((word) => !word.visualSrc || !word.visualFrameStyle || !word.visualImageStyle || !word.miniVisualFrameStyle || !word.miniVisualImageStyle)) {
        throw new Error('图片映射失败：' + [grade, semester, unit].join('/'));
      }
      enriched.forEach((word) => {
        if (!fs.existsSync(path.join(miniRoot, word.visualSrc))) throw new Error('缺少单词图片：' + word.english + ' / ' + word.visualSrc);
      });
      words.forEach((word) => {
        [['word-en', word.english], ['meaning-zh', word.chinese], ['example-en', word.example]].forEach(([kind, text]) => {
          if (text && !speechScope[kind][text]) {
            missingAudioCount += 1;
            if (!allowMissing) throw new Error('缺少语音：' + kind + ' / ' + text + '；请先补齐音频。');
          }
        });
        for (let attempt = 0; attempt < 4; attempt += 1) {
          const sample = game.spellingOptions(word.english, 4);
          if (sample.length !== 4 || new Set(sample.map((option) => option.text)).size !== 4 || sample.filter((option) => option.text === word.english).length !== 1) {
            throw new Error('拼写选项生成失败：' + word.english);
          }
        }
      });
      const quizSample = game.quizOptions(words, words[0], 'en-zh', 4);
      if (quizSample.length !== 4 || new Set(quizSample.map((option) => option.text)).size !== 4) {
        throw new Error('测验选项生成失败：' + [grade, semester, unit].join('/'));
      }
      wordCount += words.length;
    }
  });
});

if (atlas.layouts.length !== 24) throw new Error('词汇图集配置必须为 24 个单元');
if (shop.length !== 20) throw new Error('奖励商店必须包含 20 件商品');

const missingAssets = [];
atlas.layouts.forEach((layout) => {
  const filePath = path.join(miniRoot, layout[5].replace(/^\//, ''));
  if (!fs.existsSync(filePath)) missingAssets.push(layout[5]);
});
shop.forEach((item) => {
  const filePath = path.join(miniRoot, item.image.replace(/^\//, ''));
  if (!fs.existsSync(filePath)) missingAssets.push(item.image);
});
if (missingAssets.length) throw new Error('缺少资源：\n' + missingAssets.join('\n'));

const speechPackages = Array.isArray(appConfig.subpackages) ? appConfig.subpackages.filter((item) => /^speech-g\d+s\d+u\d+$/.test(item.name || '')) : [];
if (speechPackages.length !== unitCount) throw new Error('语音资源分包数应与课本分组数一致：' + unitCount);
const speechEntries = Object.values(speechMap).reduce((scopeSum, scope) => (
  scopeSum + Object.values(scope).reduce((kindSum, collection) => kindSum + Object.keys(collection).length, 0)
), 0);
const speechPackageRoots = new Set(speechPackages.map((item) => item.root));
Object.values(speechMap).forEach((scope) => {
  Object.values(scope).forEach((collection) => Object.values(collection).forEach((source) => {
    const sourceRoot = source.replace(/^\//, '').split('/')[0];
    if (!speechPackageRoots.has(sourceRoot)) throw new Error('语音映射引用未知分包：' + sourceRoot);
    const filePath = path.join(miniRoot, source.replace(/^\//, ''));
    if (!fs.existsSync(filePath)) throw new Error('缺少语音资源：' + source);
  }));
});

speechPackages.forEach((item) => {
  const packageRoot = path.join(miniRoot, item.root);
  const bytes = walk(packageRoot).reduce((sum, file) => sum + fs.statSync(file).size, 0);
  if (bytes > 2 * 1024 * 1024) throw new Error(item.name + ' 超过 2 MB：' + (bytes / 1024 / 1024).toFixed(2) + ' MB');
  ['index.js', 'index.json', 'index.wxml', 'index.wxss'].forEach((fileName) => {
    const pageFile = path.join(packageRoot, 'pages', 'index', fileName);
    if (!fs.existsSync(pageFile)) throw new Error(item.name + ' 缺少页面文件：' + fileName);
  });
});

const wxmlPath = path.join(miniRoot, 'pages', 'index', 'index.wxml');
const pageScriptPath = path.join(miniRoot, 'pages', 'index', 'page-config.js');
const wxml = fs.readFileSync(wxmlPath, 'utf8');
const pageScript = fs.readFileSync(pageScriptPath, 'utf8');
const pageStyles = fs.readFileSync(path.join(miniRoot, 'pages', 'index', 'index.wxss'), 'utf8');
const speechScript = fs.readFileSync(path.join(miniRoot, 'utils', 'speech.js'), 'utf8');
if (speechScript.indexOf('loadSubpackage') >= 0) throw new Error('普通小程序语音不得调用 wx.loadSubpackage');
const tagStack = [];
for (const match of wxml.matchAll(/<\/?([\w-]+)(?:\s[^>]*)?>/g)) {
  const raw = match[0];
  const tag = match[1];
  if (raw.startsWith('</')) {
    const opened = tagStack.pop();
    if (opened !== tag) throw new Error('WXML 标签不匹配：' + opened + ' / ' + tag);
  } else if (!raw.endsWith('/>')) {
    tagStack.push(tag);
  }
}
if (tagStack.length) throw new Error('WXML 存在未闭合标签：' + tagStack.join(', '));

const weekdayWords = atlas.enrichWords(vocabulary.grade2['下学期'].unit6, 'grade2', '下学期', 'unit6')
  .filter((word) => /^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)$/i.test(word.english));
if (weekdayWords.some((word) => word.visualLabel)) throw new Error('星期图片不得显示英文答案标签');
if (wxml.indexOf('visualLabel') >= 0) throw new Error('页面中仍残留星期英文图片标签');
if (wxml.indexOf('coin-shop-label') < 0 || wxml.indexOf('商店 ›') < 0) throw new Error('星光币区域缺少商店入口提示');
const oneCoinRewards = pageScript.match(/if \(correct\) this\.addCoins\(1\);/g) || [];
if (oneCoinRewards.length !== 2) throw new Error('中英测验和拼写选择必须每题奖励 1 枚星光币');
if (!/onShareAppMessage\s*\(/.test(pageScript) || !/onShareTimeline\s*\(/.test(pageScript) || pageScript.indexOf("path: '/pages/index/index' + shareQuery(this.data)") < 0) {
  throw new Error('分享给好友与分享到朋友圈的页面回调缺失');
}
verifyEconomyPersistence();
verifyFullUnitSpelling();
verifySharing();
if (wxml.indexOf('class="option-word"') < 0 || !/grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/.test(pageStyles) || !/\.option-word\s*\{[\s\S]*?word-break:\s*break-all/.test(pageStyles)) {
  throw new Error('拼写选项的长单词响应式样式缺失');
}

const handlers = Array.from(new Set(Array.from(wxml.matchAll(/bindtap="([^"]+)"/g), (match) => match[1])));
handlers.forEach((handler) => {
  const methodPattern = new RegExp('\\n\\s*(?:async\\s+)?' + handler + '\\s*\\(');
  if (!methodPattern.test(pageScript)) throw new Error('WXML 事件缺少处理函数：' + handler);
});

const packageBytes = walk(miniRoot).reduce((sum, file) => sum + fs.statSync(file).size, 0);
const speechRoots = new Set(speechPackages.map((item) => item.root));
const mainPackageBytes = fs.readdirSync(miniRoot, { withFileTypes: true })
  .filter((entry) => !speechRoots.has(entry.name))
  .flatMap((entry) => entry.isDirectory() ? walk(path.join(miniRoot, entry.name)) : [path.join(miniRoot, entry.name)])
  .reduce((sum, file) => sum + fs.statSync(file).size, 0);
if (mainPackageBytes > 2 * 1024 * 1024) throw new Error('主包超过 2 MB：' + (mainPackageBytes / 1024 / 1024).toFixed(2) + ' MB');
// 微信官方分包限制（2026-09 核实）：自主开发 30 MB，服务商代开发 20 MB。
// https://developers.weixin.qq.com/miniprogram/dev/framework/subpackages.html
const totalLimitMB = process.env.WX_SERVICE_PROVIDER === '1' ? 20 : 30;
if (packageBytes > totalLimitMB * 1024 * 1024) throw new Error('小程序总包超过 ' + totalLimitMB + ' MB：' + (packageBytes / 1024 / 1024).toFixed(2) + ' MB');
console.log('词汇：' + wordCount + ' 个');
console.log('图集：' + (atlas.layouts.length + require('../data/grade3-images.js').length) + ' 个；商店商品：' + shop.length + ' 件');
console.log('语音：' + speechEntries + ' 个课本单元映射，' + speechPackages.length + ' 个页面分包');
if (missingAudioCount) console.warn('开发预览检查：缺少 ' + missingAudioCount + ' 条语音映射，尚不可作为音频完整的发布包。');
console.log('主包体积：' + (mainPackageBytes / 1024 / 1024).toFixed(2) + ' MB；小程序总目录：' + (packageBytes / 1024 / 1024).toFixed(2) + ' MB');
console.log('总包限额：' + totalLimitMB + ' MB（' + (totalLimitMB === 30 ? '自主开发' : '服务商代开发') + '）');
console.log('WXML 标签与 ' + handlers.length + ' 个交互事件检查通过');
console.log('星光币奖励、购买扣币与本地恢复检查通过');
console.log('关键数据与资源检查通过');

function verifyEconomyPersistence() {
  const previousWx = global.wx;
  const previousGetCurrentPages = global.getCurrentPages;
  const storage = {
    starlightCoins: 75,
    purchasedShopItems: []
  };
  const copy = (value) => (value === undefined ? undefined : JSON.parse(JSON.stringify(value)));
  global.getCurrentPages = () => [{ route: 'pages/index/index' }];
  global.wx = {
    getStorageSync(key) { return copy(storage[key]); },
    setStorageSync(key, value) { storage[key] = copy(value); },
    removeStorageSync(key) { delete storage[key]; },
    showToast() {},
    showModal(options) {
      if (typeof options.success === 'function') options.success({ confirm: true, cancel: false });
      if (typeof options.complete === 'function') options.complete();
    }
  };

  try {
    const page = mockPage(createPageConfig());
    page.onLoad({});
    if (page.data.coins !== 75 || page.data.purchasedItems.length !== 0) throw new Error('旧版星光币存储迁移失败');
    page.addCoins(1);
    if (page.data.coins !== 76) throw new Error('答对题目后星光币没有增加 1');

    const firstItem = shop[0];
    page.purchaseShopItem({ currentTarget: { dataset: { name: firstItem.name } } });
    if (page.data.coins !== 76 - firstItem.price) throw new Error('购买商品后星光币扣除错误');
    if (page.data.purchasedItems.indexOf(firstItem.name) < 0) throw new Error('购买商品后没有记录收藏');

    const reloaded = mockPage(createPageConfig());
    reloaded.onLoad({});
    if (reloaded.data.coins !== 76 - firstItem.price) throw new Error('重新进入小程序后星光币没有恢复');
    if (reloaded.data.purchasedItems.indexOf(firstItem.name) < 0) throw new Error('重新进入小程序后已购商品没有恢复');

    const savedCoins = reloaded.data.coins;
    reloaded.purchaseShopItem({ currentTarget: { dataset: { name: firstItem.name } } });
    if (reloaded.data.coins !== savedCoins) throw new Error('重复购买已收藏商品时错误扣币');
    const expensiveItem = shop[shop.length - 1];
    reloaded.purchaseShopItem({ currentTarget: { dataset: { name: expensiveItem.name } } });
    if (reloaded.data.coins !== savedCoins || reloaded.data.purchasedItems.indexOf(expensiveItem.name) >= 0) {
      throw new Error('星光币不足时仍然购买了商品');
    }

    storage.starlightEconomyV1.coins += 3;
    reloaded.onShow();
    if (reloaded.data.coins !== 79 - firstItem.price) throw new Error('从语音分包返回后星光币没有刷新');
  } finally {
    if (previousWx === undefined) delete global.wx;
    else global.wx = previousWx;
    if (previousGetCurrentPages === undefined) delete global.getCurrentPages;
    else global.getCurrentPages = previousGetCurrentPages;
  }
}

function verifyFullUnitSpelling() {
  for (const grade of Object.values(vocabulary)) {
    for (const semester of Object.values(grade)) {
      for (const words of Object.values(semester)) {
        const page = mockPage(createPageConfig());
        page.renderSpelling = () => {};
        page.data.currentWords = words;
        page.beginSpelling();
        if (page.data.spellingWords.length !== words.length) throw new Error('拼写练习未包含所选单元的全部单词');
        if (new Set(page.data.spellingWords.map((word) => word.english)).size !== words.length) throw new Error('拼写练习的单词列表存在遗漏或重复');
      }
    }
  }
}

function verifyGradeThree() {
  const assert = require('assert');
  const originalWx = global.wx;
  const originalPages = global.getCurrentPages;
  const storage = {};
  let destination = '';
  global.getCurrentPages = () => [{ route: 'pages/index/index' }];
  global.wx = {
    getStorageSync: (key) => storage[key],
    setStorageSync: (key, value) => { storage[key] = value; },
    removeStorageSync: (key) => { delete storage[key]; },
    navigateTo: (options) => { destination = options.url; }
  };
  try {
    const page = mockPage(createPageConfig());
    page.onLoad({ grade: 'grade2', semester: '下学期', unit: 'unit6' });
    page.selectGrade({ currentTarget: { dataset: { value: 'grade3' } } });
    assert.deepStrictEqual(page.data.semesters, ['上学期']);
    assert.strictEqual(page.data.selectedSemester, '');
    assert.strictEqual(page.data.currentWords.length, 0);
    page.selectSemester({ currentTarget: { dataset: { value: '上学期' } } });
    assert.deepStrictEqual(page.data.units, ['welcome', 'unit1', 'unit2', 'unit3', 'unit4', 'unit5', 'unit6']);
    const expectedCounts = [35, 40, 28, 28, 33, 25, 28];
    page.data.units.forEach((unit, index) => {
      page.selectUnit({ currentTarget: { dataset: { value: unit } } });
      assert.strictEqual(page.data.currentWords.length, expectedCounts[index]);
      assert.ok(page.data.currentWords.every((word) => word.pronunciation && word.example && word.exampleChinese));
      page.openLearning();
      assert.ok(destination.startsWith('/audio-g3s1u' + index + '/pages/index/index?activity=learning'));
      const share = page.onShareAppMessage();
      const received = mockPage(createPageConfig());
      received.onLoad(Object.fromEntries(new URLSearchParams(share.path.split('?')[1])));
      assert.strictEqual(received.data.currentWords.length, expectedCounts[index]);
      assert.strictEqual(received.data.selectedUnit, unit);
      page.addError(page.data.currentWords[0], '拼写练习', 'wrong');
    });
    assert.strictEqual(page.data.errorEntries.length, 7);
    assert.ok(page.data.errorEntries.every((entry) => entry.grade === 'grade3' && entry.word.english));
    Object.values(page.data.errorBook).forEach((entry) => { entry.word = { english: entry.word.english, visualPlaceholder: true }; });
    page.refreshErrorEntries();
    assert.ok(page.data.errorEntries.every((entry) => entry.word.visualSrc && !entry.word.visualPlaceholder), '旧错题应恢复最新词库插图');
    page.startErrorPractice();
    assert.ok(destination.startsWith('/audio-g3s1u'));
    assert.ok(destination.includes('activity=errorPractice'));
    page.selectGrade({ currentTarget: { dataset: { value: 'grade1' } } });
    assert.deepStrictEqual(page.data.semesters, ['上学期', '下学期']);
    assert.ok(!page.data.units.includes('welcome'));
  } finally {
    global.wx = originalWx;
    global.getCurrentPages = originalPages;
  }
}

verifyGradeThree();

function verifySharing() {
  const page = mockPage(createPageConfig());
  page.data.selectedGrade = 'grade2';
  page.data.selectedSemester = '下学期';
  page.data.selectedUnit = 'unit6';
  const friendShare = page.onShareAppMessage();
  const timelineShare = page.onShareTimeline();
  if (friendShare.path !== '/pages/index/index?grade=grade2&semester=%E4%B8%8B%E5%AD%A6%E6%9C%9F&unit=unit6') {
    throw new Error('分享给好友时没有保留已选课本单元');
  }
  if (timelineShare.query !== 'grade=grade2&semester=%E4%B8%8B%E5%AD%A6%E6%9C%9F&unit=unit6') {
    throw new Error('分享到朋友圈时没有保留已选课本单元');
  }
  if (!friendShare.imageUrl || !timelineShare.imageUrl) throw new Error('分享卡片缺少封面图');
}

function mockPage(config) {
  const page = Object.assign({}, config);
  page.data = JSON.parse(JSON.stringify(config.data));
  page.setData = function setData(updates, callback) {
    Object.assign(this.data, updates);
    if (typeof callback === 'function') callback();
  };
  return page;
}

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(target) : [target];
  });
}
