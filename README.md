# LLM Paper Chat

**Paper Q&A, PDF Translation, and Literature Reviews**

在 Zotero 10 里与论文对话、生成结构化总结、翻译 PDF，并围绕整个文献目录写综述。插件在右侧边窗显示结果，论文总结可复制或保存为 Zotero 笔记。

[下载安装包](https://github.com/Daaaaxianer/llm-paper-chat/releases/download/v0.1.0/llm-paper-chat-0.1.0.xpi) · [发行记录](https://github.com/Daaaaxianer/llm-paper-chat/releases) · [反馈问题](https://github.com/Daaaaxianer/llm-paper-chat/issues)

## 功能

| 场景 | 操作 |
| --- | --- |
| 选中论文 | 围绕当前论文问答。用六段模板生成约 500 字的纯文本总结，可复制或添加为笔记。 |
| 选中收藏夹 | 按主题写目录综述、综合研究发现与局限，或分析研究空白。支持 Zotero 10 的多选收藏夹，使用各收藏夹的直属条目。 |
| 阅读 PDF | 选中文字后点击翻译，也可在设置中启用自动翻译。 |
| 翻译整篇 PDF | 用本地 BabelDOC 生成保留版式的单语或双语对照 PDF，译文作为附件添加到对应论文。 |
| 复用分析 | 按文献或收藏夹打开本地历史。相同证据、主题、模板和模型配置会复用已有结果，节省模型调用。 |

## 安装与配置

1. 下载 `llm-paper-chat-0.1.0.xpi`。在 Zotero 10 桌面的 **工具 → 插件 → 齿轮 → 从文件安装插件** 中打开它。
2. 点击文献列表工具栏上的 **LLM Paper Chat** 图标，打开右侧边窗。右击图标可直接选择 **新会话** 或 **设置**。
3. 在 **模型 API** 中选择服务、填入模型 ID 和 API 密钥，点击 **测试连接** 后保存。支持 OpenAI、Gemini、DeepSeek、Kimi、GLM、Claude 及自定义 OpenAI 兼容接口。

DeepSeek 官方接口使用 `https://api.deepseek.com` 和 `deepseek-flash`。自定义接口可填写 API 根地址或完整的 `/chat/completions` 地址。无需鉴权的本地服务可留空密钥。通过工作区 ID 授权的 Claude 密钥可用于问答和划词翻译，整篇 PDF 翻译可使用工作区范围的密钥或兼容网关。

界面默认简体中文，可切换为繁體中文、English、日本語、한국어、Français、Deutsch 或 Русский。翻译默认 English → 简体中文，源语言和目标语言可单独设置。

## 整篇 PDF 翻译

整篇原位翻译调用本机的 [BabelDOC](https://github.com/funstory-ai/BabelDOC)。问答、总结、目录分析和划词翻译只需配置模型接口。

如果已安装 [uv](https://github.com/astral-sh/uv)，可用以下命令安装并查找 BabelDOC。

~~~powershell
uv tool install --python 3.11 "BabelDOC==0.7.1"
uv tool dir --bin
~~~

打开 **设置 → 翻译 → BabelDOC 本机可执行文件**，从命令显示的目录选择 Windows 上的 `babeldoc.exe`，或 macOS、Linux 上的 `babeldoc`。第一次运行时 BabelDOC 会下载排版模型和字体。

选择 **单语原位翻译** 或 **双语原位翻译**。例如将 `Paper.pdf` 英译简中，附件文件名分别为 `Paper_eng2zh-CN.pdf` 和 `Paper_eng2zh-CN_dual.pdf`。复杂版式和扫描件的处理效果取决于 BabelDOC 与源文件。

## 历史、笔记与数据

- 选中文献或收藏夹后，点侧栏的 **历史** 查看对应结果。分析历史只保存在当前 Zotero 配置文件的本机目录，默认按生成时间保留 **30 天**。可在 **设置 → 本地历史** 调整保留天数或删除全部历史。到期的记录会在启动、读取或写入历史时清理，插件运行期间也会定期清理。
- **添加为笔记**会把论文总结保存为 Zotero 子笔记。单独存放的 PDF 会生成关联的独立笔记。笔记由 Zotero 管理，可按 Zotero 的同步设置同步。
- API 密钥保存在 Zotero 的密码存储中。每次分析或翻译所需的文本会发送给所选模型服务。单篇问答在本地选择相关 PDF 片段，目录分析优先使用摘要。大目录分批提炼证据并复用中间结果。

## English quick start

Install the [release XPI](https://github.com/Daaaaxianer/llm-paper-chat/releases/download/v0.1.0/llm-paper-chat-0.1.0.xpi) in Zotero 10 through **Tools → Plugins → Install Plugin From File**. Open the toolbar panel, choose a model provider in **Settings**, and test the connection. Change **Interface language** to **English** if desired.

Select a paper to ask questions, summarize it, or save the summary as a Zotero note. Select a collection to write a literature review or compare findings, limitations, and gaps. **History** opens saved results in the current scope. Configure the local BabelDOC executable in **Settings → Translation** to translate full PDFs.

## 从源码构建

在仓库根目录运行 `python build.py`。构建只使用 Python 标准库，在 `dist/` 中生成 XPI 和对应的更新清单 `updates.json`。

## 开源项目与致谢

- [Zotero](https://github.com/zotero/zotero) 提供桌面插件环境及文献、笔记和 PDF 阅读器接口。
- [BabelDOC](https://github.com/funstory-ai/BabelDOC) 是整篇 PDF 原位翻译所调用的独立开源程序，按其 [AGPL-3.0 许可证](https://github.com/funstory-ai/BabelDOC/blob/main/LICENSE) 分发。安装包通过命令行调用用户本机安装的 BabelDOC。
- [PDFMathTranslate-next](https://github.com/PDFMathTranslate/PDFMathTranslate-next) 为保留版式的单语和双语 PDF 翻译流程提供实现参考。
- [Zotero Translator Next](https://github.com/ECHOUniverse/zotero-translator-next) 和 [zotero-gpt](https://github.com/MuiseDestiny/zotero-gpt) 为划词翻译、模型设置和文献对话的交互设计提供参考。
- README 的结构参考 [Best README Template](https://github.com/othneildrew/Best-README-Template) 和 [Awesome README](https://github.com/matiassingers/awesome-readme)。
