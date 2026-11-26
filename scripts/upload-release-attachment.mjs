#!/usr/bin/env node
/* eslint-disable no-console */
import { existsSync, statSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";

const DEFAULT_REPO = "aohuidai/aohuidai.github.io";
const DEFAULT_TAG = "attachments";
const DEFAULT_GH_USER = "aohuidai";

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let idx = 0;
  while (value >= 1024 && idx < units.length - 1) {
    value /= 1024;
    idx += 1;
  }
  const digits = value >= 100 ? 0 : value >= 10 ? 1 : 2;
  return `${Number(value.toFixed(digits))} ${units[idx]}`;
}

function parseArgs(argv) {
  const options = {
    file: "",
    repo: DEFAULT_REPO,
    tag: DEFAULT_TAG,
    user: DEFAULT_GH_USER,
    help: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "-h" || arg === "--help") {
      options.help = true;
    } else if (arg === "--repo") {
      options.repo = argv[++i] ?? "";
    } else if (arg === "--tag") {
      options.tag = argv[++i] ?? "";
    } else if (arg === "--user") {
      options.user = argv[++i] ?? "";
    } else if (!arg.startsWith("-") && !options.file) {
      options.file = arg;
    } else {
      throw new Error(`未知参数: ${arg}`);
    }
  }

  return options;
}

function getGhEnv(user) {
  const env = { ...process.env };
  if (env.GH_TOKEN) return env;

  const tokenResult = spawnSync("gh", ["auth", "token", "--user", user], {
    encoding: "utf8",
  });
  if (tokenResult.status === 0 && tokenResult.stdout.trim()) {
    env.GH_TOKEN = tokenResult.stdout.trim();
  }
  return env;
}

function runGh(args, env, capture = true) {
  const result = spawnSync("gh", args, {
    encoding: "utf8",
    env,
    stdio: capture ? "pipe" : "inherit",
  });

  if (result.error) throw result.error;
  return result;
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help || !options.file) {
    console.log(`用法:
  npm run upload:release -- <本地文件路径> [--tag attachments] [--repo aohuidai/aohuidai.github.io]

说明:
  将大于 3MB 的大文件（单文件最大支持 2GB）上传到 GitHub Releases，
  并输出可直接填入 Pages CMS「外链 / 大文件附件」的直链地址。`);
    process.exit(options.help ? 0 : 1);
  }

  const filePath = path.resolve(options.file);
  if (!existsSync(filePath)) {
    throw new Error(`找不到文件: ${filePath}`);
  }

  const stats = statSync(filePath);
  if (!stats.isFile()) {
    throw new Error(`目标不是普通文件: ${filePath}`);
  }

  const filename = path.basename(filePath);
  const humanSize = formatFileSize(stats.size);
  const env = getGhEnv(options.user);

  const viewResult = runGh(
    ["release", "view", options.tag, "--repo", options.repo],
    env
  );
  if (viewResult.status !== 0) {
    console.log(`创建 GitHub Release 标签 "${options.tag}"...`);
    const createResult = runGh(
      [
        "release",
        "create",
        options.tag,
        "--repo",
        options.repo,
        "--title",
        "博客附件与大文件资源",
        "--notes",
        "用于托管大于 3MB 的博客附件与共享资源，支持直链下载。",
      ],
      env,
      false
    );
    if (createResult.status !== 0) {
      throw new Error("创建 GitHub Release 失败，请检查 gh 登录状态。");
    }
  }

  console.log(`正在上传 ${filename} (${humanSize}) 到 ${options.repo} ...`);
  const uploadResult = runGh(
    [
      "release",
      "upload",
      options.tag,
      filePath,
      "--repo",
      options.repo,
      "--clobber",
    ],
    env,
    false
  );
  if (uploadResult.status !== 0) {
    throw new Error("上传失败，请检查网络与 gh 权限。");
  }

  const assetsResult = runGh(
    [
      "release",
      "view",
      options.tag,
      "--repo",
      options.repo,
      "--json",
      "assets",
    ],
    env
  );
  if (assetsResult.status !== 0) {
    throw new Error("上传成功，但获取直链失败。");
  }

  const parsed = JSON.parse(assetsResult.stdout);
  const assets = Array.isArray(parsed.assets) ? parsed.assets : [];
  const normalizedTarget = filename.replaceAll(" ", ".").toLowerCase();
  const matched =
    assets.find(asset => asset.name === filename) ??
    assets.find(asset => asset.name.toLowerCase() === normalizedTarget) ??
    assets.at(-1);

  if (!matched?.url) {
    throw new Error("未能在 Release 资产列表中找到刚上传的文件。");
  }

  console.log("\n上传完成！可以直接填到 Pages CMS「外链 / 大文件附件」：\n");
  console.log(`显示名称: ${filename}`);
  console.log(`下载链接: ${matched.url}`);
  console.log(`文件大小: ${humanSize}`);
  console.log("\n如果手写 Markdown frontmatter，可直接粘贴：\n");
  console.log(`externalAttachments:
  - name: ${filename}
    url: ${matched.url}
    size: ${humanSize}
    note: GitHub Release 直链下载`);
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
