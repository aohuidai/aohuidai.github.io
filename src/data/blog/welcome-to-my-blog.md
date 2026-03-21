---
author: daihuiao
pubDatetime: 2026-03-21T13:50:00Z
title: 你好，GitHub Pages
featured: true
draft: false
tags:
  - Astro
  - GitHub Pages
  - 博客
description: 这是博客的第一篇文章，用来验证 AstroPaper、GitHub Pages 和 GitHub Actions 的发布链路已经打通。
---

这是我的第一篇博客文章。

这个站点使用 **AstroPaper** 作为主题，托管在 **GitHub Pages**，通过 **GitHub Actions** 自动构建和发布。目标很简单：少花时间折腾环境，把更多时间留给写作本身。

## 这篇文章的作用

这篇文章主要用来验证三件事：

1. Markdown 文章能被 Astro 正常识别和渲染
2. 首页、文章页和标签页可以正常展示内容
3. 推送到 GitHub 后，Pages 工作流能够自动发布

## 后续怎么写新文章

以后只需要在 `src/data/blog/` 目录里新建一个 Markdown 文件，并补上这些 frontmatter 字段：

- `title`
- `description`
- `pubDatetime`
- `tags`
- `draft`

正文部分就直接写 Markdown 即可。

## Table of contents

## 下一步

下一篇文章我会写得更实用一些，比如：

- 为什么我选 GitHub Pages 而不是自建服务器
- 如何用 Astro 写一篇结构清晰的技术文章
- 如何让博客既简单又长期可维护
