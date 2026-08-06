const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const miniRoot = path.join(root, 'miniprogram');
const vocabulary = require(path.join(miniRoot, 'data', 'vocabulary.js'));
const atlas = require(path.join(miniRoot, 'data', 'atlas.js'));
const shop = require(path.join(miniRoot, 'data', 'shop.js'));
const game = require(path.join(miniRoot, 'utils', 'game.js'));
const semesters = ['上学期', '下学期'];
let wordCount = 0;

JSON.parse(fs.readFileSync(path.join(root, 'project.config.json'), 'utf8'));
JSON.parse(fs.readFileSync(path.join(miniRoot, 'app.json'), 'utf8'));
JSON.parse(fs.readFileSync(path.join(miniRoot, 'sitemap.json'), 'utf8'));

['grade1', 'grade2'].forEach((grade) => {
  semesters.forEach((semester) => {
    for (let unitIndex = 1; unitIndex <= 6; unitIndex += 1) {
      const unit = 'unit' + unitIndex;
      const words = vocabulary[grade][semester][unit];
      if (!Array.isArray(words) || words.length === 0) throw new Error('缺少词汇：' + [grade, semester, unit].join('/'));
      const enriched = atlas.enrichWords(words, grade, semester, unit);
      if (enriched.some((word) => !word.visualStyle)) throw new Error('图片映射失败：' + [grade, semester, unit].join('/'));
      words.forEach((word) => {
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

const wxmlPath = path.join(miniRoot, 'pages', 'index', 'index.wxml');
const pageScriptPath = path.join(miniRoot, 'pages', 'index', 'index.js');
const wxml = fs.readFileSync(wxmlPath, 'utf8');
const pageScript = fs.readFileSync(pageScriptPath, 'utf8');
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

const handlers = Array.from(new Set(Array.from(wxml.matchAll(/bindtap="([^"]+)"/g), (match) => match[1])));
handlers.forEach((handler) => {
  const methodPattern = new RegExp('\\n\\s*(?:async\\s+)?' + handler + '\\s*\\(');
  if (!methodPattern.test(pageScript)) throw new Error('WXML 事件缺少处理函数：' + handler);
});

const packageBytes = walk(miniRoot).reduce((sum, file) => sum + fs.statSync(file).size, 0);
console.log('词汇：' + wordCount + ' 个');
console.log('图集：' + atlas.layouts.length + ' 个；商店商品：' + shop.length + ' 件');
console.log('小程序目录体积：' + (packageBytes / 1024 / 1024).toFixed(2) + ' MB');
console.log('WXML 标签与 ' + handlers.length + ' 个交互事件检查通过');
console.log('关键数据与资源检查通过');

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(target) : [target];
  });
}
