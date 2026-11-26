# aohuidai 的博客

基于 [Astro](https://astro.build/) 和 [AstroPaper](https://github.com/satnaing/astro-paper) 搭建，部署到 GitHub Pages。

## 本地使用

安装依赖：

```bash
npm install
```

启动开发环境：

```bash
npm run dev
```

生成生产构建：

```bash
npm run build
```

本地预览构建结果：

```bash
npm run preview
```

## 如何写新文章

### Pages CMS 网页后台

如果想直接在网页上写文章，使用 Pages CMS：

1. 打开 [Pages CMS](https://app.pagescms.org/)
2. 连接 GitHub 仓库 `aohuidai/aohuidai.github.io`
3. 进入 `博客文章`
4. 点 `New` 新建文章
5. 填标题、摘要、标签和正文
6. 确认要发布时，把 `草稿` 关掉
7. 保存后等待 GitHub Actions 自动发布

CMS 配置文件是 `.pages.yml`。它会把文章保存到 `src/data/blog/`，图片保存到 `public/blog-assets/`，附件保存到 `public/attachments/`，独立资源列表保存到 `src/data/downloads.json`，并自动生成 AstroPaper 需要的 frontmatter。

### 如何给文章添加可下载附件

1. **常规文件（≤ 3MB，PDF / Office / ZIP / 脚本 / 配置等）**：
   - 在 Pages CMS 打开任意文章，拖到页面底部的 **「附件（直接上传）」**，直接拖放文件或点击 `Upload` 上传即可（支持一次挂多个文件，也支持保留中文文件名）。
   - 保存后等待 GitHub Actions 构建完成，文章底部会自动出现带文件大小、在线预览和一键下载按钮的 **「文章附件」** 卡片，且自动汇总到网站导航栏的 **「资源」(`/downloads`)** 页面。
2. **中等文件（3MB – 25MB）**：
   - 因为 Pages CMS 托管接口单次上传有约 4.5MB 请求体限制（base64 后约 3MB 文件），可将文件通过 Git 或 GitHub 网页直接放入 `public/attachments/`，再在 Pages CMS 附件栏点 `Select` 选中即可。
3. **大文件（> 3MB，最大支持单文件 2GB）**：
   - 在本地运行一条命令自动上传到本仓库 GitHub Releases 并生成直链：
     ```bash
     npm run upload:release -- /路径/到你的大文件.zip
     ```
   - 把输出的链接填入 Pages CMS 文章底部的 **「外链 / 大文件附件（可选）」**（或者直接贴网盘链接与提取码）。
4. **独立共享文件（不写文章也能分享）**：
   - 在 Pages CMS 左侧点 **「独立资源下载」**，添加文件或外链并保存，就会直接显示在 `https://aohuidai.github.io/downloads/`。

文章目录：

```text
src/data/blog/
```

新建一个 Markdown 文件，例如：

```text
src/data/blog/my-new-post.md
```

最常用 frontmatter 示例：

```yaml
---
title: 文章标题
description: 一句话描述这篇文章
pubDatetime: 2026-03-21T14:00:00Z
tags:
  - 博客
  - 示例
draft: false
---
```

## GitHub Pages 发布

这个仓库按 `aohuidai.github.io` 的用户站方式发布。

### 一键发布

日常写完文章后，推荐用一键发布脚本：

```bash
npm run publish
```

脚本会按顺序做这些事：

1. 检查当前是否有改动
2. 执行 `npm run build`
3. 构建成功后提交文章、图片和 README 改动
4. 把当前分支推送到远端 `main`

第一次使用或不确定时，可以先演练：

```bash
npm run publish:dry
```

需要自己指定提交信息时：

```bash
npm run publish -- --message "post: add my article"
```

### Typora 绑定方式

Typora 里可以把下面这条命令配置成自定义导出命令或外部命令：

```bash
cd "/Users/daihuiao/cmd/github blog/.worktrees/astropaper-github-pages" && npm run publish
```

以后用 Typora 写完 Markdown 后，点这个命令即可发布。

### 自动发布流程

真正的线上发布流程：

1. 代码 push 到 `main`
2. GitHub Actions 自动执行构建
3. 构建产物自动发布到 GitHub Pages

你需要在仓库设置里确认：

- `Settings -> Pages`
- `Source` 选择 `GitHub Actions`

## 主要可改的位置

- 站点信息：`src/config.ts`
- 社交链接：`src/constants.ts`
- 首页文案：`src/pages/index.astro`
- 关于页：`src/pages/about.md`
- 文章目录：`src/data/blog/`

## 参考

- [Astro 官方：Deploy to GitHub Pages](https://docs.astro.build/en/guides/deploy/github/)
- [Astro 官方教程：Build a blog](https://docs.astro.build/en/tutorial/0-introduction/)
- [AstroPaper 仓库](https://github.com/satnaing/astro-paper)
