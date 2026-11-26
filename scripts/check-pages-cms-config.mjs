#!/usr/bin/env node
/* eslint-disable no-console */
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

const mediaList = Array.isArray(config.media)
  ? config.media
  : config.media
    ? [config.media]
    : [];

const assetsMedia = mediaList.find(
  item => item.name === "assets" || item.input === "public/blog-assets"
);
const attachmentsMedia = mediaList.find(
  item => item.name === "attachments" || item.input === "public/attachments"
);

assert(assetsMedia, "Missing assets media config for public/blog-assets");
assert(
  assetsMedia.input === "public/blog-assets",
  "Assets media input must use public/blog-assets"
);
assert(
  existsSync(path.join(repoRoot, assetsMedia.input)),
  `Assets media input path does not exist: ${assetsMedia.input}`
);

assert(
  attachmentsMedia,
  "Missing attachments media config for public/attachments"
);
assert(
  attachmentsMedia.input === "public/attachments",
  "Attachments media input must use public/attachments"
);
assert(
  attachmentsMedia.output === "/attachments",
  "Attachments media output must use /attachments"
);
assert(
  existsSync(path.join(repoRoot, attachmentsMedia.input)),
  `Attachments media input path does not exist: ${attachmentsMedia.input}`
);

const posts = config.content?.find(item => item.name === "posts");
assert(posts, "Missing posts collection in .pages.yml");
assert(
  posts.path === "src/data/blog",
  "Posts collection must use src/data/blog"
);
assert(
  posts.exclude?.includes("_post-template.md"),
  "Pages CMS should exclude the local post template"
);
assert(
  posts.view?.primary === "title",
  "Posts view should use title as primary field"
);
assert(
  Array.isArray(posts.view?.sort),
  "Posts view.sort must be an array to match Pages CMS schema"
);
assert(
  posts.view?.default?.order === "desc",
  "Posts view.default.order should be desc"
);
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
  "attachments",
  "externalAttachments",
]) {
  assert(fieldNames.has(field), `Missing required Pages CMS field: ${field}`);
}

const dateField = posts.fields.find(field => field.name === "pubDatetime");
assert(dateField.type === "date", "pubDatetime must be a date field");
assert(dateField.options?.time === true, "pubDatetime must include time");

const bodyField = posts.fields.find(field => field.name === "body");
assert(bodyField.type === "rich-text", "body should use the rich-text editor");

const attachmentsField = posts.fields.find(
  field => field.name === "attachments"
);
assert(attachmentsField.type === "file", "attachments must be a file field");
assert(
  attachmentsField.options?.media === "attachments",
  "attachments field must target the attachments media library"
);
assert(
  attachmentsField.options?.multiple === true,
  "attachments field must support multiple uploads"
);

const downloads = config.content?.find(item => item.name === "downloads");
assert(downloads, "Missing downloads file entry in .pages.yml");
assert(downloads.type === "file", "downloads entry must be type: file");
assert(
  downloads.path === "src/data/downloads.json",
  "downloads entry must target src/data/downloads.json"
);
assert(
  existsSync(path.join(repoRoot, downloads.path)),
  `Downloads data file does not exist: ${downloads.path}`
);

console.log("Pages CMS config looks ready.");
