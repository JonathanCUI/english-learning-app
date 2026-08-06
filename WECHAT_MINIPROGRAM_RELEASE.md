# 星光英语小助手：微信小程序打包与上架手册

## 当前迁移结果

仓库根目录已包含一个可以导入微信开发者工具的原生小程序项目：

- 小程序源码目录：`miniprogram/`
- 开发者工具项目配置：`project.config.json`
- 完整词库：2 个年级、上下学期、每学期 6 个单元，共 300 个单词
- 已迁移功能：单词学习、中英双向测验、相似拼写选择、错题本、错题拼写复习、金币与奖励商店
- 本地数据：金币、收藏和错题全部使用 `wx.setStorageSync` 保存在用户设备中
- 语音：使用百度短文本语音合成预生成 889 条本地音频，并按 24 个课本单元拆为页面分包；不依赖插件、登录或运行时 API

微信官方配置说明：<https://developers.weixin.qq.com/miniprogram/dev/framework/config.html>

## 一、准备微信小程序账号

1. 在微信公众平台注册一个小程序并完成主体认证。
2. 在“小程序管理后台 → 开发 → 开发管理 → 开发设置”中取得 AppID。
3. 根据实际主体和服务内容选择合适的教育类服务类目，并按后台提示提交所需资质。
4. 添加至少一位开发者和一位体验成员，方便真机测试。

> 主体认证、类目资质和管理员扫码属于账号侧操作，不能由代码仓库自动完成。

## 二、生成与打包百度语音

百度短文本语音合成采用“开发时批量生成 MP3、小程序播放静态文件”的方式。API Key 和 Secret Key 只在生成音频时使用，不会放进小程序，也不应提交到 Git。

1. 注册或登录百度智能云账号，并完成百度智能云的个人实名认证。
2. 打开新版[语音技术控制台](https://console.bce.baidu.com/ai-engine/speech/overview/index)，等待免费测试资源到账（官方说明通常需要 5–10 分钟）。
3. 展开左侧导航，进入“应用列表”并点击“创建应用”；勾选“短文本在线合成”，取得该应用的 API Key 和 Secret Key。如果新版页面没有显示入口，可打开[兼容版应用列表](https://console.bce.baidu.com/ai-engine/old/#/ai/speech/app/list)。
4. 在仓库根目录打开 PowerShell，只为当前终端设置密钥：

```powershell
$env:BAIDU_TTS_API_KEY='在这里粘贴 API Key'
$env:BAIDU_TTS_SECRET_KEY='在这里粘贴 Secret Key'
npm run mini:audio:sample
```

试听文件会生成到 `generated-audio/baidu-tts/`。该目录和 `.env` 文件已经加入 `.gitignore`，不会被提交。默认使用可爱童声 `per=103` 和较慢语速 `spd=4`；可以在当前终端临时调整后重新生成：

```powershell
$env:BAIDU_TTS_VOICE='110'
$env:BAIDU_TTS_SPEED='5'
npm run mini:audio:sample -- --force
```

确认试听效果后，运行以下命令生成全部单词、中文释义和英文例句，并构建小程序语音分包：

```powershell
npm.cmd run mini:audio:generate
npm.cmd run mini:audio:pack
```

完整音频约 10.55 MB，构建脚本会按“年级 × 学期 × 单元”自动拆成 24 个页面分包，每包均小于 1 MB。用户进入学习、测验、拼写或错题复习时，微信会按普通小程序的页面分包机制加载对应课本单元；无需 `wx.loadSubpackage`、云存储或百度密钥。

无需密钥也可以查看预计生成数量：

```powershell
npm run mini:audio:list
```

百度官方资料：<https://ai.baidu.com/ai-doc/SPEECH/4l9mh6qf9>、<https://ai.baidu.com/ai-doc/SPEECH/mlbxh7xie>

WechatSI 的插件声明和切换脚本已经移除，从根源上避免 `wx069ba97219f66d99 插件未授权使用` 阻止编译。

## 三、填入 AppID 并导入开发者工具

1. 把根目录 `project.config.json` 中的 `touristappid` 替换为真实 AppID。
2. 打开最新版微信开发者工具，选择“导入项目”。
3. 项目目录选择本仓库根目录，不要只选择 `miniprogram/`。
4. 确认开发者工具识别到的“小程序目录”为 `miniprogram/`。
5. 首次编译后检查控制台，不应出现缺少图片、插件未授权或基础库不兼容错误。

## 四、重新生成词库与压缩图片

网页版词库或图片有更新时，在仓库根目录运行：

```powershell
npm run mini:build
```

也可以分开执行：

```powershell
npm run mini:data
npm run mini:assets
npm run mini:verify
```

`mini:data` 会从 `Final_English_Learning_App.html` 提取完整词库；`mini:assets` 会为小程序生成经过压缩的词汇图集和商店图片；不要直接编辑自动生成的 `miniprogram/data/vocabulary.js`。

## 五、提交审核前的真机检查

建议按以下顺序逐项测试：

- 2 个年级 × 2 个学期 × 6 个单元都能进入，单词数量不为 0。
- 单词图片、英文、音标、中文和例句能正确显示。
- 中英测验答题后会依次读英文和中文。
- 拼写练习每题有 4 个相似选项，正确答案只出现一次。
- 错误答案会写入错题本，错题复习也是选择正确拼写。
- 错题复习答对后能从错题本移除。
- 金币在退出再进入后仍保留。
- 商店各分类、商品名称、图片、绿色收藏边框均正确显示。
- iPhone、Android 和不同屏幕宽度下没有遮挡或横向溢出。
- 开启与关闭网络分别测试一次；除发音插件外，学习内容应可离线使用。

## 六、隐私与合规填写

当前版本不登录、不收集手机号、头像、位置、相册、通讯录或设备标识，也不包含广告、支付和用户上传内容。错题、金币和收藏仅保存在本地。

在小程序管理后台填写“用户隐私保护指引”时，应以最终实际上线功能为准。若以后新增登录、云同步、广告、客服、支付或埋点，需要同步更新隐私指引、权限用途和代码。

建议审核描述：

> 本小程序供小学低年级儿童在家长陪同下学习英语单词，提供看图学习、中英文选择测验、相似拼写选择、错题复习和虚拟金币收藏功能。学习记录仅保存在用户本机，不提供社交、交易或用户内容发布功能。

微信官方用户隐私保护说明：<https://developers.weixin.qq.com/miniprogram/dev/framework/user-privacy/PrivacyAuthorize.html>

## 七、上传代码

### 方式 A：微信开发者工具

1. 点击右上角“上传”。
2. 版本号建议首次使用 `1.0.0`。
3. 版本备注填写“首个小程序版本：学习、测验、拼写选择、错题本和奖励商店”。
4. 管理员扫码确认上传。

### 方式 B：CI 命令

1. 在管理后台生成“小程序代码上传密钥”，并按后台要求配置上传 IP 白名单。
2. 安装依赖：`npm install`。
3. 设置环境变量后上传：

```powershell
$env:WX_APPID='你的小程序AppID'
$env:WX_PRIVATE_KEY_PATH='D:\secure\private.key'
$env:VERSION='1.0.0'
$env:DESC='首个小程序版本'
npm run mini:upload
```

不要把上传密钥放入仓库或提交到 Git。

微信官方开发者工具说明：<https://developers.weixin.qq.com/miniprogram/dev/devtools/devtools.html>

## 八、提交审核与发布

1. 登录微信公众平台，在“版本管理”中找到刚上传的开发版本。
2. 选为体验版，先让家长或老师完成一次真机验收。
3. 点击“提交审核”，填写服务类目、功能页面、版本说明和隐私信息。
4. 如果审核人员需要进入特定功能，说明：首页默认选择“一年级、上学期、Unit 1”，可直接点击任一学习模式；应用不需要账号密码。
5. 审核通过后点击“发布”。是否立即全量发布由管理员在后台确认。

代码上传、提交审核和最终发布都会影响真实微信账号与线上用户，因此需要小程序管理员在操作时扫码确认。
