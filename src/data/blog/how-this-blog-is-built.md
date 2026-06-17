---
author: Dai Huiao
title: 这个博客是怎么搭起来的
description: 记录这个 GitHub Pages 博客的结构、发布链路、写作入口和后来加上的 Pages CMS 后台。
pubDatetime: 2026-06-10T10:47:48+08:00
featured: true
draft: false
tags:
  - 博客
  - GitHub Pages
  - Astro
  - CMS
---

这篇文章是写给以后自己的。

我之前让 Codex 帮我搭了这个 GitHub 主页，后来隔了一段时间，已经不太记得它到底怎么工作了。重新梳理之后，我发现这个博客其实不是一个“神秘的网站项目”，而是一条很清楚的链路：

```text
Markdown 文章
  -> AstroPaper 读取文章和配置
  -> GitHub Actions 自动构建
  -> GitHub Pages 发布静态网站
```

后来又补了两层，让写作更顺手：

```text
Typora + 一键发布脚本
Pages CMS 网页写作后台
```

所以现在这套博客既可以本地写，也可以网页写。下面按真实使用顺序拆开看。

## 这个博客由哪些东西组成

这个博客的线上地址是：

```text
https://aohuidai.github.io/
```

对应的 GitHub 仓库是：

```text
aohuidai/aohuidai.github.io
```

它用的是 GitHub Pages 的用户主页形式。也就是说，仓库名正好是 `aohuidai.github.io`，推到 `main` 分支后，GitHub Pages 会把它发布成个人主页。

项目本身不是传统服务器，也没有长期运行的 Node 服务。真正在线上被访问的是构建后的静态文件：

```text
HTML
CSS
JavaScript
图片
RSS
sitemap
搜索索引
```

技术上，它由这几块拼起来：

- `Astro`：静态站框架，负责把页面和 Markdown 构建成网站。
- `AstroPaper`：基于 Astro 的博客主题，提供首页、文章页、标签页、归档页、RSS 等博客功能。
- `GitHub Actions`：GitHub 的自动化构建流程。
- `GitHub Pages`：托管最终生成的静态网站。
- `Pages CMS`：网页写作后台，负责把表单内容保存成 Markdown。
- `Typora`：本地 Markdown 写作工具。

简单说：AstroPaper 负责网站长什么样，GitHub Actions 负责自动干活，GitHub Pages 负责把结果放到网上，Pages CMS 和 Typora 负责写文章。

## 仓库里的关键目录

真正写博客时，最重要的是这几个位置：

```text
src/data/blog/
```

这里放所有文章。每一篇文章都是一个 Markdown 文件。

```text
src/data/blog/_post-template.md
```

这是本地写作模板。用 Typora 或编辑器手动写文章时，可以从它复制一份。

```text
.github/workflows/deploy.yml
```

这是 GitHub Actions 的发布流程。每次 `main` 分支有新提交，它会自动构建并发布网站。

```text
.pages.yml
```

这是 Pages CMS 的配置。它告诉 Pages CMS：文章在哪里、图片放哪里、后台表单有哪些字段。

```text
public/blog-assets/
```

这是给 Pages CMS 上传图片用的目录。文章里引用图片时，对应路径会是 `/blog-assets/...`。

```text
src/config.ts
```

这里放站点标题、作者、头像、时区、社交预览图等配置。

## 一篇文章为什么需要 frontmatter

AstroPaper 不是只拿正文来渲染文章。它还要知道标题、摘要、发布时间、标签和草稿状态。

这些信息放在 Markdown 文件开头，叫 frontmatter：

```md
---
author: Dai Huiao
title: 文章标题
description: 一句话描述这篇文章
pubDatetime: 2026-06-10T10:47:48+08:00
draft: false
tags:
  - 博客
---

正文从这里开始。
```

这些字段不是装饰，它们会影响网站行为：

- `title` 决定文章标题。
- `description` 会出现在列表、RSS、社交分享里。
- `pubDatetime` 决定发布时间和排序。
- `draft` 为 `true` 时不会正式发布。
- `tags` 决定标签页和文章分类。
- `author` 决定作者信息。

刚开始我觉得每次手写这些东西很麻烦，尤其是时间。后来加 Pages CMS，就是为了解决这个问题：后台里填表单，它自动生成 frontmatter。

## GitHub Actions 做了什么

GitHub Actions 可以理解成 GitHub 临时开的一台构建机器。

每次有代码推到 `main`，它会按 `.github/workflows/deploy.yml` 里的步骤运行：

```text
拉取仓库代码
  -> 安装 npm 依赖
  -> 执行 Astro 构建
  -> 上传构建产物
  -> 发布到 GitHub Pages
```

这里要记住一点：Actions 不是我的服务器。它只是一台临时机器，跑完任务就销毁。

`npm install` 或构建时安装的依赖，也只存在于那次临时环境里。真正发布到 GitHub Pages 的不是 `node_modules`，而是 Astro 构建出来的静态文件。

所以这套博客的发布逻辑是：

```text
源码和文章在 GitHub 仓库里
构建发生在 GitHub Actions 里
网站文件托管在 GitHub Pages 上
```

我本地不需要手动上传 `dist/`，也不需要维护服务器。

## 本地写作怎么走

如果我想用 Typora 写文章，流程是：

```text
进入 src/data/blog/
复制 _post-template.md
改成新文章文件名
用 Typora 写正文
确认 draft: false
运行一键发布
```

一键发布脚本是后来加的，入口在 `package.json`：

```bash
npm run publish
```

它背后执行的是：

```text
检查是否有博客相关改动
  -> npm run build
  -> git add
  -> git commit
  -> git push origin HEAD:main
```

这样做的好处是：构建失败时不会把坏文章推上去。

第一次使用时可以先跑演练：

```bash
npm run publish:dry
```

它会构建，但不会提交，也不会推送。

如果想自己写提交信息：

```bash
npm run publish -- --message "post: add my article"
```

我还把 Typora 的用法也写进了 README。理论上可以在 Typora 的自定义命令里放这一条：

```bash
cd "/Users/daihuiao/cmd/github blog/.worktrees/astropaper-github-pages" && npm run publish
```

这样就能在 Typora 里写完后，用一个命令发布。

## 网页写作怎么走

后来我觉得，只靠本地脚本还是不够优雅。因为长期来看，我更希望打开一个网页就能写文章，不想记 frontmatter，也不想手填时间。

所以又接了 Pages CMS。

Pages CMS 的配置在：

```text
.pages.yml
```

它现在定义了一个内容集合：

```text
博客文章 -> src/data/blog/
```

后台表单里有这些字段：

```text
标题
摘要
发布时间
草稿
精选文章
标签
作者
正文
```

图片上传位置是：

```text
public/blog-assets/
```

也就是说，网页后台写文章时，我不需要自己记 Markdown 文件头。Pages CMS 会把表单字段写进 frontmatter，把正文写到 frontmatter 后面，然后提交到 GitHub 仓库。

网页写作流程是：

```text
打开 Pages CMS
  -> 登录 GitHub
  -> 连接 aohuidai/aohuidai.github.io
  -> 进入「博客文章」
  -> 新建文章
  -> 填表单和正文
  -> 关掉「草稿」
  -> 保存
  -> GitHub Actions 自动发布
```

这条路最适合以后不想碰命令的时候。

## 为什么没有用完整后端 CMS

我也比较过几种方案：Keystatic、TinaCMS、Decap CMS、Sveltia CMS、CloudCannon 和 Pages CMS。

最后选 Pages CMS，是因为它最贴近现在这个博客的结构。

这个博客是 GitHub Pages 静态站，不适合再加一个需要长期运行的后端。Keystatic 和 TinaCMS 功能更强，但也更偏工程化；Decap 和 Sveltia 能做后台，但 GitHub 登录和 OAuth 配置更容易折腾；CloudCannon 很专业，但对个人博客偏重。

Pages CMS 的思路简单很多：

```text
它不接管网站
它只编辑 GitHub 仓库里的 Markdown
```

这正好符合我的需求：网站继续由 AstroPaper 生成，发布继续由 GitHub Actions 完成，写作入口变成网页后台。

## 做过的一个稳定性调整

原来 AstroPaper 会动态生成社交分享图，也就是 OG image。这个过程会尝试加载 Google Fonts。

问题是，本地或 GitHub Actions 里网络不稳定时，构建可能会卡在字体下载上。

为了让发布更稳，我把站点配置改成使用固定图片：

```text
public/astropaper-og.jpg
```

对应配置在 `src/config.ts`：

```ts
ogImage: "astropaper-og.jpg";
dynamicOgImage: false;
```

这样构建时不再依赖动态 OG 图生成，发布链路少一个外部网络风险。

## 我以后应该记住什么

这套博客真正要记住的东西不多。

如果我想在网页上写：

```text
打开 Pages CMS -> 写文章 -> 关掉草稿 -> 保存
```

如果我想在本地用 Typora 写：

```text
复制 _post-template.md -> 写正文 -> draft: false -> npm run publish
```

如果我想确认 CMS 配置没坏：

```bash
npm run check:cms
```

如果我想确认发布脚本没坏：

```bash
npm run test:publish
```

如果我想确认整个网站能构建：

```bash
npm run build
```

如果网站没有更新，优先看 GitHub 仓库里的 Actions 页面。大多数问题都能在那里看到：是 Markdown 格式错了、构建失败了，还是 Pages 部署还没完成。

## 最后重新画一遍

现在这个博客的完整链路是：

```text
写文章
  -> 本地 Typora / Pages CMS
  -> Markdown 保存到 src/data/blog/
  -> 提交到 GitHub main
  -> GitHub Actions 运行 Astro 构建
  -> GitHub Pages 发布静态文件
  -> aohuidai.github.io 更新
```

记住这条线，就基本掌握了这个博客。

它不是一个需要一直运行的程序，而是一套把 Markdown 变成网页的流水线。文章是源头，GitHub 是仓库和自动化平台，AstroPaper 是生成器，GitHub Pages 是最终展示的位置。

以后真正常用的，不是这些技术名词，而是两个入口：

```text
Pages CMS：网页写作
Typora：本地写作
```

剩下的交给 GitHub Actions。
