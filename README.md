# daihuiao 的博客

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

这个仓库按 `daihuiao.github.io` 的用户站方式发布。

发布流程：

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
