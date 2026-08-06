const fs = require('fs');
const path = require('path');

const mode = process.argv[2];
if (mode !== 'enable' && mode !== 'disable') {
  throw new Error('用法：node scripts/toggle-wechat-si.js enable|disable');
}

const root = path.resolve(__dirname, '..');
const appPath = path.join(root, 'miniprogram', 'app.json');
const pluginTemplatePath = path.join(root, 'miniprogram', 'app.wechatsi.json');
const current = JSON.parse(fs.readFileSync(appPath, 'utf8'));

if (mode === 'enable') {
  const pluginTemplate = JSON.parse(fs.readFileSync(pluginTemplatePath, 'utf8'));
  current.plugins = pluginTemplate.plugins;
} else {
  delete current.plugins;
}

fs.writeFileSync(appPath, JSON.stringify(current, null, 2) + '\n', 'utf8');
console.log(mode === 'enable' ? 'WechatSI 已启用' : 'WechatSI 已关闭（游客调试模式）');
