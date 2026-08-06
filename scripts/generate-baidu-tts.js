const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const vocabulary = require(path.join(root, 'miniprogram', 'data', 'vocabulary.js'));
const outputRoot = path.join(root, 'generated-audio', 'baidu-tts');

const args = new Set(process.argv.slice(2));
const listOnly = args.has('--list');
const sampleOnly = args.has('--sample');
const force = args.has('--force');
const voice = process.env.BAIDU_TTS_VOICE || '103';
const speed = process.env.BAIDU_TTS_SPEED || '4';
const pitch = process.env.BAIDU_TTS_PITCH || '5';
const volume = process.env.BAIDU_TTS_VOLUME || '8';

function allWords() {
  return Object.values(vocabulary).flatMap((semesters) =>
    Object.values(semesters).flatMap((units) => Object.values(units).flat())
  );
}

function uniqueTasks(words) {
  const seen = new Set();
  const tasks = [];
  const add = (kind, text) => {
    const cleanText = String(text || '').trim();
    const key = kind + '\0' + cleanText;
    if (!cleanText || seen.has(key)) return;
    seen.add(key);
    tasks.push({ kind, text: cleanText });
  };

  words.forEach((word) => {
    add('word-en', word.english);
    add('meaning-zh', word.chinese);
    add('example-en', word.example);
  });
  return tasks;
}

function sampleTasks(words) {
  const selected = [];
  for (const word of words) {
    if (!selected.some((item) => item.english.toLowerCase() === word.english.toLowerCase())) {
      selected.push(word);
    }
    if (selected.length === 3) break;
  }
  return uniqueTasks(selected).filter((task) => task.kind !== 'example-en');
}

function taskPath(task) {
  const hash = crypto.createHash('sha256').update(task.kind + '\0' + task.text).digest('hex').slice(0, 20);
  return path.join(outputRoot, task.kind, hash + '.mp3');
}

function synthesisText(task) {
  // A short pause after an isolated English word prevents unvoiced final
  // consonants such as /t/, /k/ and /p/ from being clipped at end-of-file.
  if (task.kind === 'word-en' && !/[.!?]$/.test(task.text)) return task.text + '.';
  return task.text;
}

async function getAccessToken(apiKey, secretKey) {
  const params = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: apiKey,
    client_secret: secretKey
  });
  const response = await fetch('https://aip.baidubce.com/oauth/2.0/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params
  });
  const result = await response.json();
  if (!response.ok || !result.access_token) {
    throw new Error('百度鉴权失败：' + (result.error_description || result.error || response.status));
  }
  return result.access_token;
}

async function synthesize(task, token) {
  const spokenText = synthesisText(task);
  const body = new URLSearchParams({
    tex: encodeURIComponent(spokenText),
    tok: token,
    cuid: 'starlight-english-build-tool',
    ctp: '1',
    lan: 'zh',
    spd: speed,
    pit: pitch,
    vol: volume,
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
    const details = await response.text();
    throw new Error('语音生成失败（' + task.kind + ' / ' + task.text + '）：' + details.slice(0, 300));
  }
  return Buffer.from(await response.arrayBuffer());
}

async function main() {
  const words = allWords();
  const tasks = sampleOnly ? sampleTasks(words) : uniqueTasks(words);
  const counts = tasks.reduce((result, task) => {
    result[task.kind] = (result[task.kind] || 0) + 1;
    return result;
  }, {});

  console.log('词汇条目：' + words.length);
  console.log('待生成语音：' + tasks.length + '，' + JSON.stringify(counts));
  console.log('音色 per=' + voice + '，语速 spd=' + speed + '，输出：' + outputRoot);
  if (listOnly) return;

  const apiKey = process.env.BAIDU_TTS_API_KEY;
  const secretKey = process.env.BAIDU_TTS_SECRET_KEY;
  if (!apiKey || !secretKey) {
    throw new Error(
      '缺少百度语音密钥。请只在当前 PowerShell 会话中设置 BAIDU_TTS_API_KEY 和 BAIDU_TTS_SECRET_KEY；不要把密钥写入仓库。'
    );
  }

  fs.mkdirSync(outputRoot, { recursive: true });
  const token = await getAccessToken(apiKey, secretKey);
  const manifest = [];
  let created = 0;
  let skipped = 0;

  for (let index = 0; index < tasks.length; index += 1) {
    const task = tasks[index];
    const destination = taskPath(task);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    if (!force && fs.existsSync(destination)) {
      skipped += 1;
    } else {
      const audio = await synthesize(task, token);
      fs.writeFileSync(destination, audio);
      created += 1;
    }
    manifest.push({
      kind: task.kind,
      text: task.text,
      synthesisText: synthesisText(task),
      file: path.relative(outputRoot, destination).replace(/\\/g, '/'),
      voice,
      speed
    });
    console.log('[' + (index + 1) + '/' + tasks.length + '] ' + task.kind + '：' + task.text);
  }

  fs.writeFileSync(path.join(outputRoot, sampleOnly ? 'sample-manifest.json' : 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  console.log('完成：新生成 ' + created + '，跳过已有 ' + skipped + '。');
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
