#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const repoRoot = path.resolve(fileURLToPath(import.meta.url), "../..");
const publishPaths = ["src/data/blog", "public", "README.md"];

function parseArgs(argv) {
  const options = {
    dryRun: false,
    message: "",
    skipBuild: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--dry-run") {
      options.dryRun = true;
      continue;
    }

    if (arg === "--skip-build") {
      options.skipBuild = true;
      continue;
    }

    if (arg === "-m" || arg === "--message") {
      const message = argv[index + 1];
      if (!message) {
        throw new Error(`${arg} needs a commit message.`);
      }
      options.message = message;
      index += 1;
      continue;
    }

    if (!arg.startsWith("-")) {
      continue;
    }

    throw new Error(`Unknown option: ${arg}`);
  }

  return options;
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: options.capture ? "pipe" : "inherit",
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(`Command failed: ${[command, ...args].join(" ")}`);
  }

  return result.stdout?.trim() ?? "";
}

function getChangedFiles(runner = run) {
  return runner("git", ["status", "--short", "--", ...publishPaths], {
    capture: true,
  })
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean);
}

function hasChanges(runner = run) {
  return getChangedFiles(runner).length > 0;
}

function defaultMessage() {
  const date = new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Shanghai",
  }).format(new Date());

  return `post: update blog ${date}`;
}

function printUsage() {
  console.log(`Usage:
  npm run publish
  npm run publish:dry
  node scripts/publish-blog.mjs --message "post: add my article"

Options:
  --dry-run          Run checks without committing or pushing
  -m, --message      Use a custom commit message
  --skip-build       Skip npm run build`);
}

export function publishBlog(argv = process.argv.slice(2), commands = { run }) {
  const options = parseArgs(argv);
  const message = options.message || defaultMessage();

  if (!hasChanges(commands.run)) {
    console.log("No changes to publish.");
    return;
  }

  if (!options.skipBuild) {
    commands.run("npm", ["run", "build"]);
  }

  if (options.dryRun) {
    console.log("Dry run passed. Nothing was committed or pushed.");
    return;
  }

  commands.run("git", ["add", ...publishPaths]);
  commands.run("git", ["commit", "-m", message]);
  commands.run("git", ["push", "origin", "HEAD:main"]);
  console.log("Published. GitHub Actions will update the site shortly.");
}

if (process.argv.includes("--help") || process.argv.includes("-h")) {
  printUsage();
} else if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    publishBlog();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
