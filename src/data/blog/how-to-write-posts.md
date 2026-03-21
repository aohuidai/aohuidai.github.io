---
author: Dai Huiao
pubDatetime: 2026-03-21T14:10:00Z
title: 以后我是怎么发文章的
featured: false
draft: false
tags:
  - 写作
  - 工作流
  - Markdown
description: 这篇文章记录这个博客后续的基本写作和发布流程，方便自己以后回看。
---

为了让以后写博客更轻松，我把流程控制在很少的几个步骤里。

最省事的做法有两种：

1. 直接在 GitHub 网页上新建 Markdown 文件
2. 在本地复制模板文件，写完后 `git push`

## 写作步骤

1. 参考 `src/data/blog/_post-template.md`
2. 在 `src/data/blog/` 下新建一个 Markdown 文件
3. 填好 frontmatter
4. 写正文
5. 提交并推送到 GitHub

## 最省事的 GitHub 网页发文法

1. 打开仓库里的 `src/data/blog/`
2. 点 `Add file` -> `Create new file`
3. 文件名写成类似 `my-new-post.md`
4. 把模板内容贴进去，改标题、描述、时间和正文
5. 提交到 `main`

提交后，GitHub Actions 会自动构建并发布，等一两分钟网站就会更新。

## 本地发文法

1. 复制 `src/data/blog/_post-template.md`
2. 把文件改名成你的文章文件名，比如 `my-new-post.md`
3. 填好 frontmatter
4. 写正文
5. 本地运行 `npm run dev` 或 `npm run build`
6. 提交并推送到 GitHub

## 最常用的 frontmatter

```yaml
---
title: 文章标题
description: 一句话描述文章内容
pubDatetime: 2026-03-21T14:10:00Z
tags:
  - 示例
  - Markdown
draft: false
---
```

## 发布方式

这个博客不需要自己部署服务器。

发布流程是：

1. push 到 `main`
2. GitHub Actions 自动安装依赖并执行构建
3. 构建产物发布到 GitHub Pages
4. 网站自动更新

所以后面真正需要长期维护的，其实只有文章内容本身。
