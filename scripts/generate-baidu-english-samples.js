const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const vocabulary = require(path.join(root, 'miniprogram', 'data', 'vocabulary.js'));
const args = new Set(process.argv.slice(2));
const replaceAll = args.has('--all');
const outputRoot = replaceAll
  ? path.join(root, 'generated-audio', 'baidu-tts')
  : path.join(root, 'generated-audio', 'baidu-en-samples');
const voice = process.env.BAIDU_EN_TTS_VOICE || '4194';
const speed = process.env.BAIDU_EN_TTS_SPEED || '4';

const samples = [
  { kind: 'word-en', text: 'hello' },
  { kind: 'example-en', text: 'Hello! My name is Tom.' },
  { kind: 'word-en', text: 'nice' },
  { kind: 'example-en', text: 'Nice to meet you!' },
  { kind: 'word-en', text: 'meet' },
  { kind: 'example-en', text: "Let's meet at school." }
];

function allWords() {
  return Object.values(vocabulary).flatMap((semesters) =>
    Object.values(semesters).flatMap((units) => Object.values(units).flat())
  );
}

function fullEnglishTasks() {
  const seen = new Set();
  const tasks = [];
  const add = (kind, text) => {
    const cleanText = String(text || '').trim();
    const key = kind + '\0' + cleanText;
    if (!cleanText || seen.has(key)) return;
    seen.add(key);
    tasks.push({ kind, text: cleanText });
  };
  allWords().forEach((word) => {
    add('word-en', word.english);
    add('example-en', word.example);
  });
  return tasks;
}

function fileName(sample, includeKind) {
  const name = crypto.createHash('sha256').update(sample.kind + '\0' + sample.text).digest('hex').slice(0, 20) + '.mp3';
  return includeKind ? sample.kind + '/' + name : name;
}

function synthesisText(sample) {
  if (sample.kind === 'word-en') return sample.text + '.';
  return sample.text;
}

async function getAccessToken(apiKey, secretKey) {
  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: apiKey,
    client_secret: secretKey
  });
  const response = await fetch('https://aip.baidubce.com/oauth/2.0/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body
  });
  const result = await response.json();
  if (!response.ok || !result.access_token) throw new Error('百度鉴权失败：' + (result.error_description || result.error || response.status));
  return result.access_token;
}

async function synthesize(sample, token) {
  const body = new URLSearchParams({
    tex: encodeURIComponent(synthesisText(sample)),
    tok: token,
    cuid: 'starlight-english-sample-builder',
    ctp: '1',
    // 百度短文本合成的 API 当前使用中英文混合模式；音色决定英文表现。
    lan: 'zh',
    spd: speed,
    pit: '5',
    vol: '8',
    per: voice,
    aue: '3'
  });
  const response = await fetch('https://tsn.baidu.com/text2audio', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body
  });
  const contentType = response.headers.get('content-type') || '';
  if (!response.ok || !contentType.toLowerCase().startsWith('audio/')) {
    throw new Error('生成失败：' + sample.text + '：' + (await response.text()).slice(0, 300));
  }
  return Buffer.from(await response.arrayBuffer());
}

async function main() {
  const apiKey = process.env.BAIDU_TTS_API_KEY;
  const secretKey = process.env.BAIDU_TTS_SECRET_KEY;
  if (!apiKey || !secretKey) {
    throw new Error('缺少 BAIDU_TTS_API_KEY 或 BAIDU_TTS_SECRET_KEY。请只在当前 PowerShell 会话中设置，不要写入仓库。');
  }
  fs.mkdirSync(outputRoot, { recursive: true });
  const token = await getAccessToken(apiKey, secretKey);
  const manifest = [];
  const tasks = replaceAll ? fullEnglishTasks() : samples;
  console.log('使用音色 per=' + voice + '，待生成英文资源：' + tasks.length + ' 条');
  for (let index = 0; index < tasks.length; index += 1) {
    const sample = tasks[index];
    const file = fileName(sample, replaceAll);
    const destination = path.join(outputRoot, file);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.writeFileSync(destination, await synthesize(sample, token));
    manifest.push({ ...sample, synthesisText: synthesisText(sample), file, provider: 'baidu-tts', voice, speed });
    console.log('[' + (index + 1) + '/' + tasks.length + '] ' + sample.kind + '：' + sample.text);
  }
  if (replaceAll) {
    const manifestPath = path.join(outputRoot, 'manifest.json');
    const existing = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const preserved = existing.filter((item) => item.kind !== 'word-en' && item.kind !== 'example-en');
    fs.writeFileSync(manifestPath, JSON.stringify([...preserved, ...manifest], null, 2) + '\n');
    console.log('英文资源已全部替换；中文语音未改动。请继续运行 npm.cmd run mini:audio:pack。');
    return;
  }
  fs.writeFileSync(path.join(outputRoot, 'sample-manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  console.log('试听完成：' + outputRoot);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
