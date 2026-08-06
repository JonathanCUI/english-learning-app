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

JSON.parse(fs.readFileSync(path.join(root, 'project.config.json'), 'utf8'));
const appConfig = JSON.parse(fs.readFileSync(path.join(miniRoot, 'app.json'), 'utf8'));
JSON.parse(fs.readFileSync(path.join(miniRoot, 'sitemap.json'), 'utf8'));

['grade1', 'grade2'].forEach((grade) => {
  semesters.forEach((semester) => {
    for (let unitIndex = 1; unitIndex <= 6; unitIndex += 1) {
      const unit = 'unit' + unitIndex;
      const words = vocabulary[grade][semester][unit];
      if (!Array.isArray(words) || words.length === 0) throw new Error('缺少词汇：' + [grade, semester, unit].join('/'));
      const speechScope = speechMap[[grade, semester, unit].join('|')];
      if (!speechScope) throw new Error('缺少语音单元映射：' + [grade, semester, unit].join('/'));
      const enriched = atlas.enrichWords(words, grade, semester, unit);
      if (enriched.some((word) => !word.visualSrc || !word.visualFrameStyle || !word.visualImageStyle || !word.miniVisualFrameStyle || !word.miniVisualImageStyle)) {
        throw new Error('图片映射失败：' + [grade, semester, unit].join('/'));
      }
      words.forEach((word) => {
        if (!speechScope['word-en'][word.english]) throw new Error('缺少英文单词语音：' + word.english);
        if (!speechScope['meaning-zh'][word.chinese]) throw new Error('缺少中文释义语音：' + word.chinese);
        if (word.example && !speechScope['example-en'][word.example]) throw new Error('缺少英文例句语音：' + word.example);
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
if (speechPackages.length !== 24) throw new Error('语音资源必须拆分为 24 个课本单元分包');
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
verifyEconomyPersistence();

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
if (packageBytes > 20 * 1024 * 1024) throw new Error('小程序总包超过 20 MB：' + (packageBytes / 1024 / 1024).toFixed(2) + ' MB');
console.log('词汇：' + wordCount + ' 个');
console.log('图集：' + atlas.layouts.length + ' 个；商店商品：' + shop.length + ' 件');
console.log('语音：889 条唯一内容，' + speechEntries + ' 个课本单元映射，24 个页面分包');
console.log('主包体积：' + (mainPackageBytes / 1024 / 1024).toFixed(2) + ' MB；小程序总目录：' + (packageBytes / 1024 / 1024).toFixed(2) + ' MB');
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
