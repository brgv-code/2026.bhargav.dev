import { marked } from "marked";
import type { Entry } from "./daily-notes.types";

marked.use({ gfm: true, breaks: true });

export function todayStr() {
  return new Date().toISOString().split("T")[0];
}

export function fmtDate(str: string) {
  const d = new Date(str + "T00:00:00");
  return d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function uid() {
  return Math.random().toString(36).slice(2, 9);
}

export function allTags(entries: Entry[]) {
  const s = new Set<string>();
  entries.forEach((e) =>
    e.blocks.forEach((b) => b.tags.forEach((t) => s.add(t)))
  );
  return [...s].sort();
}

export function localStorageKeyForToday() {
  return `notebook:draft:${todayStr()}`;
}

export function markdownToHtml(raw: string): string {
  const t = raw?.trim() ?? "";
  if (!t) return "";
  return (marked.parse(t) as string) ?? "";
}

export function splitCodeBlockContent(
  content: string,
  defaultLang?: string
): Array<{ type: "markdown" | "code"; content: string; lang?: string }> {
  const FENCED_RE = /```(\w*)\n([\s\S]*?)```/g;
  const segments: Array<{
    type: "markdown" | "code";
    content: string;
    lang?: string;
  }> = [];
  let match: RegExpExecArray | null;
  let lastEnd = 0;
  while ((match = FENCED_RE.exec(content)) !== null) {
    if (match.index > lastEnd) {
      const md = content.slice(lastEnd, match.index);
      if (md.trim()) segments.push({ type: "markdown", content: md });
    }
    const lang =
      (match[1]?.trim() || defaultLang?.trim() || "").trim() || undefined;
    segments.push({ type: "code", content: match[2], lang });
    lastEnd = FENCED_RE.lastIndex;
  }
  if (lastEnd < content.length) {
    const md = content.slice(lastEnd);
    if (md.trim()) segments.push({ type: "markdown", content: md });
  }
  if (segments.length === 0) {
    return [{ type: "code", content, lang: defaultLang }];
  }
  return segments;
}

export function formatCodeSnippet(raw: string): string {
  const lines = raw.replace(/\t/g, "  ").split("\n");
  while (lines.length && !lines[0].trim()) lines.shift();
  while (lines.length && !lines[lines.length - 1].trim()) lines.pop();
  if (!lines.length) return "";
  let minIndent = Infinity;
  for (const line of lines) {
    if (!line.trim()) continue;
    const match = line.match(/^ */);
    const indent = match ? match[0].length : 0;
    if (indent < minIndent) minIndent = indent;
  }
  if (!Number.isFinite(minIndent) || minIndent === 0) return lines.join("\n");
  return lines
    .map((line) =>
      line.length >= minIndent ? line.slice(minIndent) : line.trimStart()
    )
    .join("\n");
}
