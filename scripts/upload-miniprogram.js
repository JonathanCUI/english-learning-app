const path = require('path');
const ci = require('miniprogram-ci');

const appid = process.env.WX_APPID;
const privateKeyPath = process.env.WX_PRIVATE_KEY_PATH;
const version = process.env.VERSION || '1.0.0';
const desc = process.env.DESC || '星光英语小助手首次小程序版本';
const robot = Number(process.env.WX_ROBOT || 1);

if (!appid || !privateKeyPath) {
  throw new Error('请设置 WX_APPID 和 WX_PRIVATE_KEY_PATH 环境变量');
}

const project = new ci.Project({
  appid,
  type: 'miniProgram',
  projectPath: path.resolve(__dirname, '..'),
  privateKeyPath: path.resolve(privateKeyPath),
  ignores: ['node_modules/**/*', '.git/**/*']
});

ci.upload({
  project,
  version,
  desc,
  robot,
  setting: {
    es6: true,
    es7: true,
    minify: true,
    codeProtect: true,
    autoPrefixWXSS: true
  },
  onProgressUpdate: console.log
}).then(() => {
  console.log('代码上传成功：' + version);
}).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
