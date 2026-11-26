import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import {
  countPostAttachments,
  encodePublicHref,
  formatFileSize,
  getHostLabel,
  loadStandaloneDownloads,
  resolvePostAttachments,
} from "./attachments.ts";

test("formatFileSize formats bytes, KB, and MB cleanly", () => {
  assert.equal(formatFileSize(512), "512 B");
  assert.equal(formatFileSize(2048), "2 KB");
  assert.equal(formatFileSize(1536 * 1024), "1.5 MB");
});

test("encodePublicHref safely encodes Chinese filenames without double encoding", () => {
  assert.equal(
    encodePublicHref("/attachments/投影表格 OCR.xlsx"),
    "/attachments/%E6%8A%95%E5%BD%B1%E8%A1%A8%E6%A0%BC%20OCR.xlsx"
  );
  assert.equal(
    encodePublicHref("/attachments/%E6%B5%8B%E8%AF%95.pdf"),
    "/attachments/%E6%B5%8B%E8%AF%95.pdf"
  );
});

test("resolvePostAttachments resolves local file size, preview flag, and external links", () => {
  const tempRoot = mkdtempSync(path.join(os.tmpdir(), "blog-attachments-"));
  const publicDir = path.join(tempRoot, "public");
  mkdirSync(path.join(publicDir, "attachments"), { recursive: true });
  writeFileSync(
    path.join(publicDir, "attachments", "示例报告.pdf"),
    Buffer.alloc(2048, 1)
  );

  try {
    const resolved = resolvePostAttachments(
      {
        attachments: ["/attachments/示例报告.pdf"],
        externalAttachments: [
          {
            name: "完整数据包.zip",
            url: "https://github.com/aohuidai/aohuidai.github.io/releases/download/attachments/data.zip",
            size: "42 MB",
            note: "GitHub Release 直链",
          },
        ],
      },
      { publicDir }
    );

    assert.equal(resolved.length, 2);

    assert.equal(resolved[0].name, "示例报告.pdf");
    assert.equal(resolved[0].downloadName, "示例报告.pdf");
    assert.equal(resolved[0].typeLabel, "PDF");
    assert.equal(resolved[0].size, "2 KB");
    assert.equal(resolved[0].previewable, true);
    assert.equal(resolved[0].isExternal, false);

    assert.equal(resolved[1].name, "完整数据包.zip");
    assert.equal(resolved[1].typeLabel, "ZIP");
    assert.equal(resolved[1].size, "42 MB");
    assert.equal(resolved[1].hostLabel, "GitHub Release");
    assert.equal(resolved[1].isExternal, true);
    assert.equal(resolved[1].previewable, false);
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
});

test("countPostAttachments handles null, string, and mixed arrays", () => {
  assert.equal(countPostAttachments({}), 0);
  assert.equal(
    countPostAttachments({ attachments: "/attachments/single.pdf" }),
    1
  );
  assert.equal(
    countPostAttachments({
      attachments: ["/attachments/a.pdf", ""],
      externalAttachments: [
        { name: "安装包", url: "https://example.com/app.dmg" },
      ],
    }),
    2
  );
});

test("loadStandaloneDownloads loads local and external resources from json", () => {
  const tempRoot = mkdtempSync(path.join(os.tmpdir(), "blog-downloads-"));
  const publicDir = path.join(tempRoot, "public");
  mkdirSync(path.join(publicDir, "attachments"), { recursive: true });
  writeFileSync(
    path.join(publicDir, "attachments", "demo.xlsx"),
    Buffer.alloc(4096, 2)
  );
  const dataFile = path.join(tempRoot, "downloads.json");
  writeFileSync(
    dataFile,
    JSON.stringify({
      items: [
        {
          title: "整理表格模板",
          file: "/attachments/demo.xlsx",
          category: "模板",
        },
        {
          title: "大文件镜像",
          url: "https://pan.quark.cn/s/example",
          size: "1.2 GB",
        },
      ],
    })
  );

  try {
    const items = loadStandaloneDownloads({ dataFile, publicDir });
    assert.equal(items.length, 2);
    assert.equal(items[0].name, "整理表格模板");
    assert.equal(items[0].downloadName, "demo.xlsx");
    assert.equal(items[0].size, "4 KB");
    assert.equal(items[0].typeLabel, "XLSX");
    assert.equal(items[1].hostLabel, "夸克网盘");
    assert.equal(getHostLabel("https://pan.baidu.com/s/abc"), "百度网盘");
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
});
