# 星光英语小助手微信小程序

这是 `Final_English_Learning_App.html` 的原生微信小程序版本。

入口页面位于 `pages/index/index`，业务数据位于 `data/`，通用游戏和语音逻辑位于 `utils/`。请从仓库根目录导入微信开发者工具，因为 `project.config.json` 在根目录。

默认配置兼容 `touristappid`，不会加载需要账号授权的发音插件。配置真实 AppID 并在微信后台添加 WechatSI 后，运行 `npm run mini:tts:on` 开启发音；运行 `npm run mini:tts:off` 可恢复游客调试模式。

构建、验证、语音插件和正式上架步骤请阅读根目录的 `WECHAT_MINIPROGRAM_RELEASE.md`。
