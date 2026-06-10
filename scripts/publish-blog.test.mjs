import assert from "node:assert/strict";
import { test } from "node:test";
import { publishBlog } from "./publish-blog.mjs";

test("dry run builds but does not commit or push", () => {
  const calls = [];
  publishBlog(["--dry-run", "--skip-build"], {
    run(command, args, options = {}) {
      calls.push([command, args]);
      if (options.capture) {
        return " M src/data/blog/draft.md";
      }
    },
  });

  assert.deepEqual(calls, [
    ["git", ["status", "--short", "--", "src/data/blog", "public", "README.md"]],
  ]);
});

test("custom message is used for commit and current branch is pushed to main", () => {
  const calls = [];
  publishBlog(["--skip-build", "--message", "post: add note"], {
    run(command, args, options = {}) {
      calls.push([command, args]);
      if (options.capture) {
        return " M src/data/blog/note.md";
      }
    },
  });

  assert.deepEqual(calls, [
    ["git", ["status", "--short", "--", "src/data/blog", "public", "README.md"]],
    ["git", ["add", "src/data/blog", "public", "README.md"]],
    ["git", ["commit", "-m", "post: add note"]],
    ["git", ["push", "origin", "HEAD:main"]],
  ]);
});

test("build runs before commit by default", () => {
  const calls = [];
  publishBlog(["--message", "post: add note"], {
    run(command, args, options = {}) {
      calls.push([command, args]);
      if (options.capture) {
        return " M src/data/blog/note.md";
      }
    },
  });

  assert.deepEqual(calls[1], ["npm", ["run", "build"]]);
});

test("no changes exits before build, commit, and push", () => {
  const calls = [];
  publishBlog([], {
    run(command, args, options = {}) {
      calls.push([command, args]);
      if (options.capture) {
        return "";
      }
    },
  });

  assert.deepEqual(calls, [
    ["git", ["status", "--short", "--", "src/data/blog", "public", "README.md"]],
  ]);
});
