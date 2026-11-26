import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

export type ExternalAttachmentInput = {
  name: string;
  url: string;
  size?: string | null;
  note?: string | null;
};

export type StandaloneDownloadInput = {
  title: string;
  description?: string | null;
  file?: string | null;
  url?: string | null;
  size?: string | null;
  category?: string | null;
  updatedAt?: string | null;
};

export type PostAttachmentSource = {
  title: string;
  href: string;
  pubDatetime: Date;
};

export type ResolvedAttachment = {
  name: string;
  downloadName?: string;
  href: string;
  extension: string;
  typeLabel: string;
  size?: string;
  note?: string;
  isExternal: boolean;
  previewable: boolean;
  hostLabel?: string;
  category?: string;
  updatedAt?: string;
  sourcePost?: PostAttachmentSource;
};

type PostAttachmentFields = {
  attachments?: string | string[] | null;
  externalAttachments?: ExternalAttachmentInput[] | null;
};

const PREVIEWABLE_EXTENSIONS = new Set([
  "pdf",
  "png",
  "jpg",
  "jpeg",
  "webp",
  "gif",
  "svg",
  "bmp",
  "avif",
  "txt",
  "md",
  "json",
  "csv",
  "html",
  "htm",
  "mp4",
  "webm",
  "mp3",
  "wav",
  "ogg",
]);

const DEFAULT_PUBLIC_DIR = path.resolve(process.cwd(), "public");
const DEFAULT_DOWNLOADS_FILE = path.resolve(
  process.cwd(),
  "src/data/downloads.json"
);

export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "";
  if (bytes < 1024) return `${bytes} B`;

  const units = ["KB", "MB", "GB", "TB"];
  let value = bytes / 1024;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  const digits = value >= 100 ? 0 : value >= 10 ? 1 : 2;
  return `${Number(value.toFixed(digits))} ${units[unitIndex]}`;
}

export function isExternalUrl(value: string): boolean {
  return /^https?:\/\//i.test(value.trim());
}

function safeDecode(segment: string): string {
  let current = segment;
  for (let i = 0; i < 2; i += 1) {
    try {
      const next = decodeURIComponent(current);
      if (next === current) break;
      current = next;
    } catch {
      break;
    }
  }
  return current;
}

export function normalizeLocalPath(rawPath: string): string {
  const trimmed = rawPath.trim().replaceAll("\\", "/");
  if (!trimmed) return "";

  const withoutQuery = trimmed.split(/[?#]/)[0] ?? "";
  const decodedSegments = withoutQuery
    .split("/")
    .filter(Boolean)
    .map(segment => safeDecode(segment))
    .filter(segment => segment !== "." && segment !== "..");

  if (decodedSegments.length === 0) return "";
  return `/${decodedSegments.join("/")}`;
}

export function encodePublicHref(rawPath: string): string {
  const normalized = normalizeLocalPath(rawPath);
  if (!normalized) return "";

  const encoded = normalized
    .slice(1)
    .split("/")
    .map(segment => encodeURIComponent(segment))
    .join("/");

  return `/${encoded}`;
}

export function extractFilename(rawTarget: string): string {
  const trimmed = rawTarget.trim();
  if (!trimmed) return "未命名附件";

  if (isExternalUrl(trimmed)) {
    try {
      const url = new URL(trimmed);
      const segments = url.pathname.split("/").filter(Boolean);
      const last = segments.at(-1);
      if (last) return safeDecode(last);
      return url.hostname;
    } catch {
      return trimmed;
    }
  }

  const normalized = normalizeLocalPath(trimmed);
  const lastSegment = normalized.split("/").filter(Boolean).at(-1);
  return lastSegment || "未命名附件";
}

export function extractExtension(filename: string): string {
  const clean = filename.split(/[?#]/)[0] ?? filename;
  const lastDot = clean.lastIndexOf(".");
  if (lastDot <= 0 || lastDot === clean.length - 1) return "";
  return clean.slice(lastDot + 1).toLowerCase();
}

export function getTypeLabel(extension: string, isExternal: boolean): string {
  if (!extension) return isExternal ? "LINK" : "FILE";
  const normalized = extension.toUpperCase();
  return normalized.length > 6 ? normalized.slice(0, 6) : normalized;
}

export function getHostLabel(urlString: string): string | undefined {
  try {
    const url = new URL(urlString);
    const host = url.hostname.toLowerCase();

    if (
      host === "github.com" &&
      url.pathname.toLowerCase().includes("/releases/download/")
    ) {
      return "GitHub Release";
    }
    if (host === "github.com" || host.endsWith(".github.com")) {
      return "GitHub";
    }
    if (host.includes("pan.baidu.com")) return "百度网盘";
    if (host.includes("alipan.com") || host.includes("aliyundrive.com")) {
      return "阿里云盘";
    }
    if (host.includes("pan.quark.cn")) return "夸克网盘";
    if (host.includes("drive.google.com")) return "Google Drive";

    return url.hostname.replace(/^www\./, "");
  } catch {
    return undefined;
  }
}

function getLocalFileSize(
  normalizedLocalPath: string,
  publicDir: string
): string | undefined {
  if (!normalizedLocalPath.startsWith("/")) return undefined;

  const resolvedPublicDir = path.resolve(publicDir);
  const relativeSegments = normalizedLocalPath.slice(1).split("/");
  const candidate = path.resolve(resolvedPublicDir, ...relativeSegments);

  if (
    candidate !== resolvedPublicDir &&
    !candidate.startsWith(`${resolvedPublicDir}${path.sep}`)
  ) {
    return undefined;
  }

  if (!existsSync(candidate)) return undefined;

  try {
    const stats = statSync(candidate);
    if (!stats.isFile()) return undefined;
    return formatFileSize(stats.size);
  } catch {
    return undefined;
  }
}

function resolveSingleTarget(
  rawTarget: string,
  meta: {
    name?: string | null;
    size?: string | null;
    note?: string | null;
    category?: string | null;
    updatedAt?: string | null;
    sourcePost?: PostAttachmentSource;
  },
  publicDir: string
): ResolvedAttachment | null {
  const target = rawTarget.trim();
  if (!target) return null;

  if (isExternalUrl(target)) {
    const fallbackName = extractFilename(target);
    const displayName = meta.name?.trim() || fallbackName;
    const extension =
      extractExtension(displayName) || extractExtension(fallbackName);

    return {
      name: displayName,
      href: target,
      extension,
      typeLabel: getTypeLabel(extension, true),
      size: meta.size?.trim() || undefined,
      note: meta.note?.trim() || undefined,
      isExternal: true,
      previewable: false,
      hostLabel: getHostLabel(target),
      category: meta.category?.trim() || undefined,
      updatedAt: meta.updatedAt?.trim() || undefined,
      sourcePost: meta.sourcePost,
    };
  }

  const normalizedPath = normalizeLocalPath(target);
  if (!normalizedPath) return null;

  const filename = extractFilename(normalizedPath);
  const displayName = meta.name?.trim() || filename;
  const extension = extractExtension(filename) || extractExtension(displayName);
  const detectedSize = getLocalFileSize(normalizedPath, publicDir);

  return {
    name: displayName,
    downloadName: filename,
    href: encodePublicHref(normalizedPath),
    extension,
    typeLabel: getTypeLabel(extension, false),
    size: meta.size?.trim() || detectedSize,
    note: meta.note?.trim() || undefined,
    isExternal: false,
    previewable: PREVIEWABLE_EXTENSIONS.has(extension),
    category: meta.category?.trim() || undefined,
    updatedAt: meta.updatedAt?.trim() || undefined,
    sourcePost: meta.sourcePost,
  };
}

export function resolvePostAttachments(
  data: PostAttachmentFields,
  options: {
    publicDir?: string;
    sourcePost?: PostAttachmentSource;
  } = {}
): ResolvedAttachment[] {
  const publicDir = options.publicDir ?? DEFAULT_PUBLIC_DIR;
  const resolved: ResolvedAttachment[] = [];
  const seenHrefs = new Set<string>();

  const localEntries = Array.isArray(data.attachments)
    ? data.attachments
    : typeof data.attachments === "string"
      ? [data.attachments]
      : [];

  for (const entry of localEntries) {
    if (typeof entry !== "string") continue;
    const item = resolveSingleTarget(
      entry,
      { sourcePost: options.sourcePost },
      publicDir
    );
    if (!item || seenHrefs.has(item.href)) continue;
    seenHrefs.add(item.href);
    resolved.push(item);
  }

  const externalEntries = Array.isArray(data.externalAttachments)
    ? data.externalAttachments
    : [];

  for (const entry of externalEntries) {
    if (!entry || typeof entry.url !== "string") continue;
    const item = resolveSingleTarget(
      entry.url,
      {
        name: entry.name,
        size: entry.size,
        note: entry.note,
        sourcePost: options.sourcePost,
      },
      publicDir
    );
    if (!item || seenHrefs.has(item.href)) continue;
    seenHrefs.add(item.href);
    resolved.push(item);
  }

  return resolved;
}

export function countPostAttachments(data: PostAttachmentFields): number {
  const localCount = Array.isArray(data.attachments)
    ? data.attachments.filter(item => typeof item === "string" && item.trim())
        .length
    : typeof data.attachments === "string" && data.attachments.trim()
      ? 1
      : 0;

  const externalCount = Array.isArray(data.externalAttachments)
    ? data.externalAttachments.filter(
        item =>
          item &&
          typeof item.url === "string" &&
          item.url.trim() &&
          typeof item.name === "string" &&
          item.name.trim()
      ).length
    : 0;

  return localCount + externalCount;
}

export function resolveStandaloneDownloads(
  items: StandaloneDownloadInput[],
  options: { publicDir?: string } = {}
): ResolvedAttachment[] {
  const publicDir = options.publicDir ?? DEFAULT_PUBLIC_DIR;
  const resolved: ResolvedAttachment[] = [];

  for (const item of items) {
    if (!item) continue;
    const target = item.file?.trim() || item.url?.trim() || "";
    if (!target) continue;

    const entry = resolveSingleTarget(
      target,
      {
        name: item.title,
        note: item.description,
        size: item.size,
        category: item.category,
        updatedAt: item.updatedAt,
      },
      publicDir
    );

    if (entry) {
      resolved.push(entry);
    }
  }

  return resolved;
}

export function loadStandaloneDownloads(
  options: { dataFile?: string; publicDir?: string } = {}
): ResolvedAttachment[] {
  const dataFile = options.dataFile ?? DEFAULT_DOWNLOADS_FILE;
  if (!existsSync(dataFile)) return [];

  try {
    const raw = readFileSync(dataFile, "utf8");
    const parsed = JSON.parse(raw) as { items?: StandaloneDownloadInput[] };
    if (!Array.isArray(parsed.items)) return [];
    return resolveStandaloneDownloads(parsed.items, {
      publicDir: options.publicDir,
    });
  } catch {
    return [];
  }
}
