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

CMS 配置文件是 `.pages.yml`。它会把文章保存到 `src/data/blog/`，图片保存到 `public/blog-assets/`，并自动生成 AstroPaper 需要的 frontmatter。

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
