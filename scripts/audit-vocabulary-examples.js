// Reproducible inventory for the manual picture/example review; no TTS credentials needed.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const assert = require('assert');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'Final_English_Learning_App.html'), 'utf8');
const literal = html.match(/const VOCABULARY = ([\s\S]*?);\s*\n\s*function getCurrentWords/)[1];
const vocabulary = Function('GRADE3_VOCABULARY', 'return (' + literal + ');')(JSON.parse(JSON.stringify(require('../data/grade3-semester1.js'))));
const changes = require('../data/example-revisions.js').apply(vocabulary);
const built = require('../miniprogram/data/vocabulary.js');
assert.deepStrictEqual(vocabulary, built, '网页与小程序词库必须同步');
const atlas = require('../miniprogram/data/atlas.js');
const audioMap = require('../miniprogram/data/audio.js');
const audioRoot = path.join(root, 'generated-audio', 'baidu-tts');
const pending = new Map();
const entries = [];
for (const [grade, semesters] of Object.entries(vocabulary)) {
  for (const [semester, units] of Object.entries(semesters)) {
    for (const [unit, words] of Object.entries(units)) {
      const scope = [grade, semester, unit].join('|');
      const visuals = atlas.enrichWords(words, grade, semester, unit);
      words.forEach((word, index) => {
        const change = changes.find(item => item.scope === scope && item.english === word.english);
        if (change) {
          assert.ok(word.example.split(/\s+/).length <= 9, '修订例句不超过九词：' + word.english);
          assert.ok(word.example.toLowerCase().includes(word.english.toLowerCase()), '修订例句须含目标词（可含复数形式）：' + word.english);
          assert.ok(word.exampleChinese && change.visualCue);
        }
        assert.ok(visuals[index].visualSrc && !visuals[index].visualPlaceholder);
        const entry = {
          scope, english: word.english, chinese: word.chinese,
          example: word.example, exampleChinese: word.exampleChinese,
          image: visuals[index].visualSrc, imageStyle: visuals[index].visualImageStyle,
          revised: !!change, ...(change ? { previousExample: change.previousExample, previousChinese: change.previousChinese, visualCue: change.visualCue } : {})
        };
        entries.push(entry);
        for (const [kind, text] of [['word-en', word.english], ['meaning-zh', word.chinese], ['example-en', word.example]]) {
          const key = kind + '\0' + text;
          const hash = crypto.createHash('sha256').update(key).digest('hex').slice(0, 20);
          if (!fs.existsSync(path.join(audioRoot, kind, hash + '.mp3'))) pending.set(key, { kind, text });
        }
      });
    }
  }
}
const missingMappings = entries.filter(entry => !(audioMap[entry.scope]['example-en'] || {})[entry.example]).length;
const report = {
  reviewedOn: '2026-10-07', reviewedEntries: entries.length, revisedEntries: changes.length,
  method: '人工核对已有图集及当前映射；优先采用贴合画面的简单例句。问候、关系、日期和抽象词采用合理的情境表达，并非仅凭图片唯一推导。',
  imageChanges: [{ word: 'part', previous: '拼图块', current: '复用 arm 的手臂插图', reason: '匹配身体部位义项' }],
  spellingCorrections: [{ previous: 'sonwy', current: 'snowy' }],
  pendingUniqueAudio: pending.size, pendingAudio: [...pending.values()], missingExampleMappings: missingMappings,
  entries
};
if (process.argv.includes('--write')) {
  fs.mkdirSync(path.join(root, 'reports'), { recursive: true });
  fs.writeFileSync(path.join(root, 'reports', 'vocabulary-example-audit.json'), JSON.stringify(report, null, 2) + '\n');
}
console.log('图文核对：' + entries.length + ' 条；修订例句：' + changes.length + ' 条；待生成唯一音频：' + pending.size + ' 条；待更新例句映射：' + missingMappings + ' 条');
