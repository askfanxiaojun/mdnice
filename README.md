# Markdown Nice

**支持自定义排版风格的 Markdown 编辑器，也能把文章生成小红书风格的图文长图。**

在编辑区写作，在预览区查看排版效果。你可以选择主题、调整字体与排版密度，也可以通过自定义 CSS 修改标题、正文、引用、图片等元素的样式，让内容更符合自己的表达风格。同一篇 Markdown 文章，既可以用于微信公众号、知乎和稀土掘金排版，也可以生成适合小红书发布的图片。

## 核心功能

- **Markdown 写作与实时预览**：支持标题、列表、引用、表格、图片、代码块等常用语法；单次回车即可换行，空行用于分段。
- **自定义排版风格**：支持主题切换、字体选择和排版密度调整；通过自定义 CSS 精细修改颜色、字号、间距、边框等样式，并实时查看效果。
- **多平台内容排版**：支持将排版后的内容复制到微信公众号、知乎和稀土掘金，减少重复调整格式的工作。
- **小红书图文长图生成**：将文章转换为小红书风格的竖版图文，自动生成首页封面并分页；可调整主题、字体、密度，以及拖动缩放图片。
- **图片批量导出**：小红书模式每页输出 **1080 × 1800 PNG**，按顺序命名并打包为 ZIP 下载，解压后即可用于发布。

适合公众号作者、小红书创作者，以及希望把教程、观点、知识笔记排版后分享的人。

## 界面与效果

### 编辑器总览

左侧编辑 Markdown，右侧实时预览排版结果。

> 📷 截图待补充：编辑器完整界面，建议同时展示正文、主题菜单和预览效果。

<!-- 截图上传至 assets/screenshots/editor-overview.png 后，取消下一行的注释即可显示。 -->
<!-- ![Markdown 编辑器与实时预览](assets/screenshots/editor-overview.png) -->

### 自定义排版

展示同一篇文章如何通过主题或自定义样式呈现不同风格。

> 📷 截图待补充：自定义样式编辑界面，或同一篇文章修改风格前后的对比。

<!-- 截图上传至 assets/screenshots/custom-style.png 后，取消下一行的注释即可显示。 -->
<!-- ![自定义 Markdown 排版风格](assets/screenshots/custom-style.png) -->

### 小红书图文长图

文章自动生成首页封面与后续内容页，可在分页预览中继续调整。

> 📷 截图待补充：小红书排版工作区，建议展示首页封面、正文分页和顶部调整工具。

<!-- 截图上传至 assets/screenshots/xiaohongshu-preview.png 后，取消下一行的注释即可显示。 -->
<!-- ![小红书封面与图文分页预览](assets/screenshots/xiaohongshu-preview.png) -->

> 📷 效果图待补充：将导出的封面和 1～2 张正文图片拼在一起，展示最终发布效果。

<!-- 图片上传至 assets/screenshots/xiaohongshu-output.png 后，取消下一行的注释即可显示。 -->
<!-- ![小红书图文导出效果](assets/screenshots/xiaohongshu-output.png) -->

## 如何使用

1. 在编辑区输入或粘贴 Markdown 内容。
2. 选择主题、字体与排版密度；需要更细致的风格调整时，修改自定义 CSS。
3. 发布文字内容时，使用对应平台的复制功能，将排版结果粘贴到目标编辑器。
4. 制作小红书图文时，点击右侧「小红书排版」，查看封面与分页，按需调整样式和图片大小。
5. 点击「下载全部 ZIP」，解压后获得按顺序排列的 PNG 图片。

建议使用最新版 Chrome。导出含网络图片的内容时，图片地址需要支持跨域读取；不同发布平台对样式的支持存在差异，发布前请检查最终效果。

## 本地运行与部署

使用 Node.js 22 和 Yarn 1.22.22 安装依赖：

```bash
yarn install --frozen-lockfile
NODE_OPTIONS=--openssl-legacy-provider yarn start
```

生产构建：

```bash
NODE_OPTIONS=--openssl-legacy-provider PUBLIC_URL=. yarn build
```

构建产物位于 `docs/`，可部署到静态网站托管服务。仓库配置了 GitHub Pages 工作流，合并到 `main` 后会从最新源码构建并发布。

## 项目来源与致谢

本项目由 [askfanxiaojun](https://github.com/askfanxiaojun) 在 Fork 版本 [amiaoapp/mdtohtml](https://github.com/amiaoapp/mdtohtml) 的基础上继续开发，原始项目为 [mdnice/markdown-nice](https://github.com/mdnice/markdown-nice)。感谢原项目及各 Fork 版本的所有贡献者。

本项目遵循 [GPL-3.0](LICENSE) 开源协议。欢迎通过 [Issues](https://github.com/askfanxiaojun/mdnice/issues) 提出问题和建议，或提交 Pull Request。
