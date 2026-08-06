const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const miniRoot = path.join(root, 'miniprogram');
const sourceRoot = path.join(root, 'generated-audio', 'baidu-tts');
const manifestPath = path.join(sourceRoot, 'manifest.json');
const vocabulary = require(path.join(miniRoot, 'data', 'vocabulary.js'));

if (!fs.existsSync(manifestPath)) {
  throw new Error('缺少完整语音清单，请先运行 npm run mini:audio:generate');
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
if (!Array.isArray(manifest) || manifest.length === 0) throw new Error('语音清单为空');

const items = manifest.map((entry) => {
  const source = path.resolve(sourceRoot, entry.file);
  if (!source.startsWith(sourceRoot + path.sep) || !fs.existsSync(source)) {
    throw new Error('缺少或越界的语音文件：' + entry.file);
  }
  return { entry, source, size: fs.statSync(source).size };
});

const itemKey = (kind, text) => kind + '\0' + text;
const itemByKey = new Map(items.map((item) => [itemKey(item.entry.kind, item.entry.text), item]));
const packs = [];
['grade1', 'grade2'].forEach((grade, gradeIndex) => {
  ['上学期', '下学期'].forEach((semester, semesterIndex) => {
    for (let unitIndex = 1; unitIndex <= 6; unitIndex += 1) {
      const shortName = 'g' + (gradeIndex + 1) + 's' + (semesterIndex + 1) + 'u' + unitIndex;
      packs.push({
        grade,
        semester,
        unit: 'unit' + unitIndex,
        scope: [grade, semester, 'unit' + unitIndex].join('|'),
        name: 'speech-' + shortName,
        root: 'audio-' + shortName,
        bytes: 0,
        items: []
      });
    }
  });
});
fs.readdirSync(miniRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && /^audio-unit-\d+$/.test(entry.name))
  .forEach((entry) => {
    const legacyRoot = path.resolve(miniRoot, entry.name);
    if (!legacyRoot.startsWith(miniRoot + path.sep)) throw new Error('旧语音分包路径越界：' + legacyRoot);
    fs.rmSync(legacyRoot, { recursive: true, force: true });
  });
packs.forEach((pack) => {
  const seen = new Set();
  const words = vocabulary[pack.grade][pack.semester][pack.unit] || [];
  words.forEach((word) => {
    [
      ['word-en', word.english],
      ['meaning-zh', word.chinese],
      ['example-en', word.example]
    ].forEach(([kind, text]) => {
      if (!text) return;
      const key = itemKey(kind, text);
      if (seen.has(key)) return;
      const item = itemByKey.get(key);
      if (!item) throw new Error('语音清单缺少：' + kind + ' / ' + text);
      seen.add(key);
      pack.items.push(item);
      pack.bytes += item.size;
    });
  });
});

const audioMap = {};
packs.forEach((pack) => {
  const packRoot = path.resolve(miniRoot, pack.root);
  if (!packRoot.startsWith(miniRoot + path.sep)) throw new Error('语音分包路径越界：' + packRoot);
  fs.rmSync(packRoot, { recursive: true, force: true });
  const assetRoot = path.join(packRoot, 'audio');
  const pageRoot = path.join(packRoot, 'pages', 'index');
  fs.mkdirSync(assetRoot, { recursive: true });
  fs.mkdirSync(pageRoot, { recursive: true });

  fs.writeFileSync(path.join(pageRoot, 'index.js'), "const createPageConfig = require('../../../pages/index/page-config.js');\n\nPage(createPageConfig());\n");
  fs.copyFileSync(path.join(miniRoot, 'pages', 'index', 'index.json'), path.join(pageRoot, 'index.json'));
  fs.copyFileSync(path.join(miniRoot, 'pages', 'index', 'index.wxml'), path.join(pageRoot, 'index.wxml'));
  fs.copyFileSync(path.join(miniRoot, 'pages', 'index', 'index.wxss'), path.join(pageRoot, 'index.wxss'));

  audioMap[pack.scope] = { 'word-en': {}, 'meaning-zh': {}, 'example-en': {} };

  pack.items.forEach(({ entry, source }) => {
    const fileName = path.basename(entry.file);
    const destination = path.join(assetRoot, fileName);
    fs.copyFileSync(source, destination);
    audioMap[pack.scope][entry.kind][entry.text] = '/' + pack.root + '/audio/' + fileName;
  });
});

const audioMapSource = [
  '// 此文件由 scripts/build-mini-audio-packs.js 自动生成，请勿手工修改。',
  'module.exports = ' + JSON.stringify(audioMap, null, 2) + ';',
  ''
].join('\n');
fs.writeFileSync(path.join(miniRoot, 'data', 'audio.js'), audioMapSource);

const appJsonPath = path.join(miniRoot, 'app.json');
const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
appJson.subpackages = packs.map((pack) => ({
  root: pack.root,
  name: pack.name,
  pages: ['pages/index/index']
}));
fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2) + '\n');

packs.forEach((pack) => {
  console.log(pack.name + '：' + pack.items.length + ' 个文件，' + (pack.bytes / 1024 / 1024).toFixed(2) + ' MB');
});
const copiedItems = packs.reduce((sum, pack) => sum + pack.items.length, 0);
const copiedBytes = packs.reduce((sum, pack) => sum + pack.bytes, 0);
console.log('语音分包完成：' + copiedItems + ' 个单元资源副本，共 ' + (copiedBytes / 1024 / 1024).toFixed(2) + ' MB；原始唯一语音 ' + manifest.length + ' 条');
