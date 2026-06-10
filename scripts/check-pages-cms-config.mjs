#!/usr/bin/env node
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { parse } from "yaml";

const repoRoot = path.resolve(fileURLToPath(import.meta.url), "../..");
const configPath = path.join(repoRoot, ".pages.yml");
const config = parse(readFileSync(configPath, "utf8"));

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const posts = config.content?.find(item => item.name === "posts");
const mediaInput = config.media?.input;

assert(mediaInput === "public/blog-assets", "Media input must use public/blog-assets");
assert(
  existsSync(path.join(repoRoot, mediaInput)),
  `Media input path does not exist: ${mediaInput}`
);
assert(posts, "Missing posts collection in .pages.yml");
assert(posts.path === "src/data/blog", "Posts collection must use src/data/blog");
assert(
  posts.exclude?.includes("_post-template.md"),
  "Pages CMS should exclude the local post template"
);
assert(posts.view?.primary === "title", "Posts view should use title as primary field");
assert(
  existsSync(path.join(repoRoot, posts.path)),
  `Posts path does not exist: ${posts.path}`
);

const fieldNames = new Set(posts.fields?.map(field => field.name));
for (const field of [
  "title",
  "description",
  "pubDatetime",
  "draft",
  "tags",
  "author",
  "body",
]) {
  assert(fieldNames.has(field), `Missing required Pages CMS field: ${field}`);
}

const dateField = posts.fields.find(field => field.name === "pubDatetime");
assert(dateField.type === "date", "pubDatetime must be a date field");
assert(dateField.options?.time === true, "pubDatetime must include time");

const bodyField = posts.fields.find(field => field.name === "body");
assert(bodyField.type === "rich-text", "body should use the rich-text editor");

console.log("Pages CMS config looks ready.");
