# 三年级上学期词表接入

来源：项目根目录“三年级上学期”内三张课本照片，第 86–88 页。

| 分组 | 练习条目 |
| --- | ---: |
| Welcome | 35 |
| Unit 1 | 40 |
| Unit 2 | 28 |
| Unit 3 | 28 |
| Unit 4 | 33 |
| Unit 5 | 25 |
| Unit 6 | 28 |
| 合计 | 217 |

粗体与非粗体词均录入。`be (am, is, are)`、`a (an)`、`let’s = let us` 和亲属称谓的括号形式分别练习；`take care of sb/sth`、`look at sb/sth` 去除语法占位符 sb/sth。nine 在课本 Unit 1 中，因此不额外加入 Unit 4。例句、例句中文和美式音标为学习辅助内容，并非照片原文。课本英式拼写 colour、colourful、mum、miaow 等保持原样。

词表源文件：`data/grade3-semester1.js`，网页版直接引用，小程序使用 `npm.cmd run mini:data` 提取。三年级下学期未开放。

三年级 217 个词条中，115 个复用拼写和首个释义一致的现有插图，102 个使用新增的 8 张卡通图集。图集不包含英文答案；抽象词以情境辅助表达。

插图映射源文件为 `data/grade3-images.js`。原始生成图保存在 `assets/grade3/source/`，标准化裁切图在 `assets/grade3/`，小程序压缩副本在 `miniprogram/assets/vocab/g3-s1-*-extra.jpg`。修改原图后依次执行 `powershell -ExecutionPolicy Bypass -File scripts/normalize-grade3-atlases.ps1`、`npm.cmd run mini:assets` 和 `npm.cmd run mini:verify`。裁切标准化用于避免相邻图格露出，JPEG 副本用于控制主包体积。

## 补齐语音

在已有百度语音环境变量的 PowerShell 中执行：

```powershell
Set-Location D:\Projects\EnglishLearning
$env:BAIDU_EN_TTS_VOICE = '4194'
$env:BAIDU_TTS_VOICE = '103'
$env:BAIDU_TTS_SPEED = '4'
npm.cmd run mini:audio:update
```

如果是新开的 PowerShell，需要先在该窗口设置 `BAIDU_TTS_API_KEY` 和 `BAIDU_TTS_SECRET_KEY`。不要将密钥保存进项目或发到聊天里。

命令会提取词库、只生成缺失音频、打包所有单元并运行严格校验；任一步失败即停止。已有音频与音色记录会保留。英文使用 4194，中文使用 103。

打包沿用按单元划分的 31 个语音分包，直接复制原始音频，不进行有损压缩或裁剪。

如已完成生成，仅需重新打包和校验，无需再次调用百度接口：

```powershell
npm.cmd run mini:audio:pack
if ($LASTEXITCODE -eq 0) { npm.cmd run mini:verify }
```

依据[微信官方分包文档](https://developers.weixin.qq.com/miniprogram/dev/framework/subpackages.html)（2026-09 核实），自主开发的小程序总包限额为 30 MB，服务商代开发为 20 MB；主包和单个分包仍分别不超过 2 MB。此项目按自主开发的 30 MB 校验，严格检查音频完整性和单包限制。若改为服务商代开发，设置环境变量 `WX_SERVICE_PROVIDER=1`，校验会采用 20 MB。
