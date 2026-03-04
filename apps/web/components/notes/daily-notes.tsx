"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { marked } from "marked";
import { CodeBlock } from "./code-block";

// Enable GitHub Flavored Markdown: lists, tables, strikethrough, task lists, autolinks
marked.use({ gfm: true, breaks: true });

// Enable GitHub Flavored Markdown: lists, tables, strikethrough, task lists, autolinks
marked.use({ gfm: true, breaks: true });

// ─── Block type config ────────────────────────────────────────────────────────
type BlockType = "thought" | "code" | "link" | "learning" | "quote";

type Block = {
  id: string;
  type: BlockType;
  content: string;
  lang?: string;
  meta?: string;
  tags: string[];
  pinned?: boolean;
};

type EntryVisibility = "public" | "private";

type Entry = {
  id: string;
  date: string; // YYYY-MM-DD
  blocks: Block[];
  visibility: EntryVisibility;
  pinned?: boolean;
};

const BLOCK_TYPES: Record<
  BlockType,
  { label: string; icon: string; colorVar: string }
> = {
  thought: { label: "thought", icon: "◈", colorVar: "var(--editorial-text)" },
  code: {
    label: "code",
    icon: "⌥",
    colorVar: "var(--editorial-accent)",
  },
  link: {
    label: "link",
    icon: "↗",
    colorVar: "var(--editorial-accent2)",
  },
  learning: {
    label: "learning",
    icon: "◉",
    colorVar: "var(--editorial-accent-strong)",
  },
  quote: {
    label: "quote",
    icon: "❝",
    colorVar: "var(--editorial-accent-warm)",
  },
};

const TAG_COLORS = [
  "var(--editorial-accent)",
  "var(--editorial-accent2)",
  "var(--editorial-accent-strong)",
  "var(--editorial-accent-warm)",
  "var(--editorial-text-muted)",
  "var(--editorial-border)",
];

// ─── Sample seed data ─────────────────────────────────────────────────────────
const SEED: Entry[] = [
  {
    id: "1",
    date: "2026-03-04",
    visibility: "public",
    blocks: [
      {
        id: "b1",
        type: "learning",
        content:
          "useEffect with external stores should use useSyncExternalStore instead — prevents tearing in concurrent mode.",
        tags: ["react", "hooks"],
      },
      {
        id: "b2",
        type: "code",
        lang: "tsx",
        content: `// Bad: syncing state via useEffect
useEffect(() => {
  setCount(store.getCount());
}, [store]);

// Good: use the dedicated hook
const count = useSyncExternalStore(
  store.subscribe,
  store.getCount
);`,
        tags: ["react"],
      },
      {
        id: "b3",
        type: "link",
        content: "https://react.dev/reference/react/useSyncExternalStore",
        meta: "useSyncExternalStore – React Docs",
        tags: ["react", "reference"],
      },
    ],
  },
  {
    id: "2",
    date: "2026-03-03",
    visibility: "public",
    blocks: [
      {
        id: "b4",
        type: "thought",
        content:
          "Turborepo's remote caching is genuinely magic. 8min CI → 40sec after enabling. The graph-aware task scheduling is the real unlock though.",
        tags: ["dx", "monorepo"],
      },
      {
        id: "b5",
        type: "learning",
        content:
          "Payload CMS collections use access control at the field level — you can hide fields per role without a separate endpoint.",
        tags: ["payload", "cms"],
      },
      {
        id: "b6",
        type: "quote",
        content:
          "The key question is not 'does it work?' but 'can you understand it six months from now?'",
        meta: "— John Carmack",
        tags: [],
      },
    ],
  },
].map((entry) => ({ pinned: false, ...entry })) as Entry[];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function fmtDate(str: string) {
  const d = new Date(str + "T00:00:00");
  return d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function allTags(entries: Entry[]) {
  const s = new Set<string>();
  entries.forEach((e) =>
    e.blocks.forEach((b) => b.tags?.forEach((t) => s.add(t))),
  );
  return [...s].sort();
}

function localStorageKeyForToday() {
  return `notebook:draft:${todayStr()}`;
}

// Notes-specific contrast: dark ink and visible borders on cream
const NOTE_INK = "#1a1a1a";
const NOTE_INK_MUTED = "rgba(26, 26, 26, 0.82)";
const NOTE_BORDER = "rgba(26, 26, 26, 0.28)";

// best-effort, dependency-free formatter so pasted code
// looks closer to how Prettier would present it (dedented, consistent spaces)
function formatCodeSnippet(raw: string): string {
  const lines = raw.replace(/\t/g, "  ").split("\n");
  // drop leading and trailing empty lines
  while (lines.length && !lines[0].trim()) lines.shift();
  while (lines.length && !lines[lines.length - 1].trim()) lines.pop();
  if (!lines.length) return "";
  // compute minimum indent (in spaces) across non-empty lines
  let minIndent = Infinity;
  for (const line of lines) {
    if (!line.trim()) continue;
    const match = line.match(/^ */);
    const indent = match ? match[0].length : 0;
    if (indent < minIndent) minIndent = indent;
  }
  if (!Number.isFinite(minIndent) || minIndent === 0) {
    return lines.join("\n");
  }
  return lines
    .map((line) => (line.length >= minIndent ? line.slice(minIndent) : line.trimStart()))
    .join("\n");
}

// ─── Presentational components ────────────────────────────────────────────────

type TagProps = {
  label: string;
  color: string;
  onClick?: () => void;
  active?: boolean;
};

function Tag({ label, onClick, active }: TagProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="border font-mono text-[12px] uppercase tracking-[0.06em] rounded-sm px-2.5 py-1 transition-colors"
      style={{
        borderColor: active ? NOTE_INK : NOTE_BORDER,
        backgroundColor: active ? NOTE_INK : "transparent",
        color: active ? "#f7f5f0" : NOTE_INK,
      }}
    >
      {label}
    </button>
  );
}

type BlockEditFormProps = {
  block: Block;
  onSave: (payload: { content: string; lang?: string; meta?: string; tags: string[] }) => void;
  onCancel: () => void;
};

function BlockEditForm({ block, onSave, onCancel }: BlockEditFormProps) {
  const [content, setContent] = useState(block.content);
  const [lang, setLang] = useState(block.lang ?? "");
  const [meta, setMeta] = useState(block.meta ?? "");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(block.tags ?? []);

  const commitTag = () => {
    const raw = tagInput.trim().toLowerCase();
    if (!raw || tags.includes(raw)) return;
    setTags((prev) => [...prev, raw]);
    setTagInput("");
  };

  const removeTag = (t: string) => setTags((prev) => prev.filter((x) => x !== t));

  const handleSave = () => {
    const trimmed = content.trim();
    if (!trimmed) return;
    onSave({
      content: block.type === "code" ? formatCodeSnippet(trimmed) : trimmed,
      lang: block.type === "code" ? (lang.trim() || undefined) : undefined,
      meta: block.type === "link" || block.type === "quote" ? (meta.trim() || undefined) : undefined,
      tags,
    });
  };

  const cfg = BLOCK_TYPES[block.type];
  const isCode = block.type === "code";
  const isLinkOrQuote = block.type === "link" || block.type === "quote";

  return (
    <div
      id={block.id}
      className="rounded-sm px-4 py-3 mt-2 space-y-3 border border-dashed"
      style={{ borderColor: NOTE_BORDER, backgroundColor: "var(--editorial-surface)" }}
    >
      <div className="flex items-center gap-2">
        <span className="font-mono text-[14px]" style={{ color: NOTE_INK }} aria-hidden>
          {cfg.icon} edit
        </span>
      </div>
      {isCode && (
        <input
          value={lang}
          onChange={(e) => setLang(e.target.value)}
          placeholder="language (tsx, py, bash…)"
          className="w-full rounded-sm text-[14px] px-3 py-2 outline-none border font-mono"
          style={{ backgroundColor: "var(--editorial-bg)", borderColor: NOTE_BORDER, color: NOTE_INK }}
        />
      )}
      {isLinkOrQuote && (
        <input
          value={meta}
          onChange={(e) => setMeta(e.target.value)}
          placeholder={block.type === "link" ? "display title (optional)" : "attribution"}
          className="w-full rounded-sm text-[14px] px-3 py-2 outline-none border font-mono"
          style={{ backgroundColor: "var(--editorial-bg)", borderColor: NOTE_BORDER, color: NOTE_INK }}
        />
      )}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Content…"
        rows={isCode ? 5 : 3}
        className="w-full rounded-sm text-[14px] leading-[1.5] px-3 py-2 outline-none resize-y border font-mono"
        style={{
          backgroundColor: "var(--editorial-bg)",
          borderColor: NOTE_BORDER,
          color: NOTE_INK,
          fontFamily: isCode ? "var(--font-mono, ui-monospace)" : "",
        }}
      />
      <div>
        <input
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              commitTag();
            }
          }}
          placeholder="tags (Enter or comma)"
          className="w-full rounded-sm text-[14px] px-3 py-2 outline-none border font-mono"
          style={{ backgroundColor: "var(--editorial-bg)", borderColor: NOTE_BORDER, color: NOTE_INK }}
        />
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {tags.map((t) => (
              <span
                key={t}
                className="font-mono text-[12px] uppercase tracking-wide px-2 py-0.5 rounded border"
                style={{ borderColor: NOTE_BORDER, color: NOTE_INK }}
              >
                {t}
                <button
                  type="button"
                  onClick={() => removeTag(t)}
                  className="ml-1.5 opacity-70 hover:opacity-100"
                  aria-label={`Remove tag ${t}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleSave}
          className="font-mono text-[13px] px-3 py-1.5 rounded-sm border bg-transparent cursor-pointer"
          style={{ borderColor: NOTE_INK, color: NOTE_INK }}
        >
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="font-mono text-[13px] px-3 py-1.5 rounded-sm border bg-transparent cursor-pointer"
          style={{ borderColor: NOTE_BORDER, color: NOTE_INK }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

type BlockRendererProps = {
  entryDate: string;
  block: Block;
  isEditable: boolean;
  isEditing?: boolean;
  onDelete: () => void;
  onEdit?: () => void;
  onCopyLink?: () => void;
  onSaveEdit?: (payload: { content: string; lang?: string; meta?: string; tags: string[] }) => void;
  onCancelEdit?: () => void;
};

function BlockRenderer({
  entryDate,
  block,
  isEditable,
  isEditing = false,
  onDelete,
  onEdit,
  onCopyLink,
  onSaveEdit,
  onCancelEdit,
}: BlockRendererProps) {
  const cfg = BLOCK_TYPES[block.type];
  const isCode = block.type === "code";
  const isLink = block.type === "link";
  const isQuote = block.type === "quote";

  if (isEditing && isEditable && onSaveEdit && onCancelEdit) {
    return (
      <BlockEditForm
        block={block}
        onSave={onSaveEdit}
        onCancel={onCancelEdit}
      />
    );
  }

  return (
    <div
      id={block.id}
      className="flex gap-3 items-start py-3 border-b border-dashed relative"
      style={{ borderColor: NOTE_BORDER }}
    >
      <span
        className="font-mono text-[16px] min-w-[20px] mt-[2px] select-none"
        style={{ color: cfg.colorVar }}
        aria-hidden
      >
        {cfg.icon}
      </span>

      <div className="flex-1 min-w-0 space-y-2">
        {isCode && block.lang && (
          <span className="font-mono text-[11px] tracking-[0.15em] uppercase block" style={{ color: NOTE_INK }}>
            {block.lang}
          </span>
        )}

        {isCode ? (
          <div
            className="rounded-sm border-l-2 overflow-x-auto text-[14px] leading-[1.6] font-mono"
            style={{
              borderColor: "var(--editorial-accent)",
            }}
          >
            <CodeBlock
              code={block.content}
              language={block.lang}
              preClassName="m-0 px-4 py-3"
              className="text-inherit"
            />
          </div>
        ) : isLink ? (
          <div className="space-y-1">
            <a
              href={block.content}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-[14px] underline-offset-2 hover:underline break-all"
              style={{ color: "var(--editorial-accent2)" }}
            >
              {block.meta || block.content}
            </a>
            {block.meta && (
              <div className="font-mono text-[13px] break-all" style={{ color: NOTE_INK_MUTED }}>
                {block.content}
              </div>
            )}
          </div>
        ) : isQuote ? (
          <div className="border-l-2 pl-3 border-[var(--editorial-accent-warm)] space-y-1">
            <p className="m-0 text-[15px] italic leading-[1.6]" style={{ color: NOTE_INK }}>
              {block.content}
            </p>
            {block.meta && (
              <span className="font-mono text-[13px]" style={{ color: NOTE_INK_MUTED }}>
                {block.meta}
              </span>
            )}
          </div>
        ) : (
          <p
            className={`m-0 text-[15px] leading-[1.65] ${block.type === "learning" ? "border-l-2 pl-3" : ""}`}
            style={{
              color: NOTE_INK,
              ...(block.type === "learning" ? { borderColor: BLOCK_TYPES.learning.colorVar } : {}),
            }}
          >
            {block.content}
          </p>
        )}

        {block.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {block.tags.map((t, i) => (
              <Tag
                key={`${entryDate}-${block.id}-${t}`}
                label={t}
                color={TAG_COLORS[i % TAG_COLORS.length]}
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col items-end gap-1 ml-2">
        {isEditable && onEdit && (
          <button
            type="button"
            onClick={onEdit}
            aria-label="Edit this block"
            className="font-mono text-[13px] hover:text-[var(--editorial-accent)] transition-colors bg-transparent cursor-pointer px-0.5"
            style={{ color: NOTE_INK }}
          >
            ✏
          </button>
        )}
        {onCopyLink && (
          <button
            type="button"
            onClick={onCopyLink}
            aria-label="Copy link to this block"
            className="font-mono text-[13px] hover:text-[var(--editorial-accent)] transition-colors bg-transparent cursor-pointer px-0.5"
            style={{ color: NOTE_INK }}
          >
            ⧉
          </button>
        )}
        {isEditable && (
          <button
            type="button"
            onClick={onDelete}
            aria-label="Delete this block"
            className="font-mono text-[14px] hover:text-[var(--editorial-accent-warm)] transition-colors bg-transparent cursor-pointer px-0.5"
            style={{ color: NOTE_INK }}
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}

type AddBlockPanelProps = {
  onAdd: (block: Block) => void;
  onClose: () => void;
};

function AddBlockPanel({ onAdd, onClose }: AddBlockPanelProps) {
  const [type, setType] = useState<BlockType>("thought");
  const [content, setContent] = useState("");
  const [lang, setLang] = useState("tsx");
  const [meta, setMeta] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const commitTag = () => {
    const raw = tagInput.trim().toLowerCase();
    if (!raw) return;
    if (!tags.includes(raw)) {
      setTags((prev) => [...prev, raw]);
    }
    setTagInput("");
  };

  const handleAdd = () => {
    if (!content.trim()) return;
    const finalContent = type === "code" ? formatCodeSnippet(content) : content;
    onAdd({
      id: uid(),
      type,
      content: finalContent,
      lang: type === "code" ? lang : undefined,
      meta: type === "link" || type === "quote" ? meta : undefined,
      tags,
    });
    setContent("");
    setMeta("");
    setTagInput("");
    setTags([]);
  };

  const placeholder =
    type === "code"
      ? "// paste your code snippet…"
      : type === "link"
        ? "https://…"
        : type === "learning"
          ? "What did you learn?"
          : type === "quote"
            ? "The quote…"
            : "What's on your mind?";

  return (
    <div className="rounded-sm px-4 py-4 mt-3 space-y-3" style={{ backgroundColor: "var(--editorial-surface)", border: `1px solid ${NOTE_BORDER}` }}>
      <div className="flex flex-wrap gap-2">
        {Object.entries(BLOCK_TYPES).map(([k, v]) => {
          const isActive = type === k;
          return (
            <button
              key={k}
              type="button"
              onClick={() => setType(k as BlockType)}
              className="font-mono text-[13px] tracking-[0.06em] uppercase px-3 py-1.5 rounded-sm border transition-colors bg-transparent cursor-pointer"
              style={{
                borderColor: isActive ? NOTE_INK : NOTE_BORDER,
                backgroundColor: isActive ? NOTE_INK : "transparent",
                color: isActive ? "#f7f5f0" : NOTE_INK,
              }}
            >
              {v.icon} {v.label}
            </button>
          );
        })}
      </div>

      {type === "code" && (
        <input
          value={lang}
          onChange={(e) => setLang(e.target.value)}
          placeholder="language (tsx, py, bash…)"
          className="w-full rounded-sm text-[15px] px-3 py-2 outline-none border"
          style={{ backgroundColor: "var(--editorial-bg)", borderColor: NOTE_BORDER, color: NOTE_INK }}
        />
      )}

      {(type === "link" || type === "quote") && (
        <input
          value={meta}
          onChange={(e) => setMeta(e.target.value)}
          placeholder={
            type === "link" ? "display title (optional)" : "attribution"
          }
          className="w-full rounded-sm text-[15px] px-3 py-2 outline-none border"
          style={{ backgroundColor: "var(--editorial-bg)", borderColor: NOTE_BORDER, color: NOTE_INK }}
        />
      )}

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        rows={type === "code" ? 6 : 3}
        className="w-full rounded-sm text-[15px] leading-[1.55] px-3 py-2 outline-none resize-vertical border"
        style={{
          backgroundColor: "var(--editorial-bg)",
          borderColor: NOTE_BORDER,
          color: NOTE_INK,
          fontFamily: type === "code" ? "var(--font-mono, ui-monospace)" : "",
        }}
      />

      <div>
        <input
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              commitTag();
            }
          }}
          placeholder="tags: react, hooks, dx"
          className="w-full rounded-sm text-[15px] px-3 py-2 outline-none border"
          style={{ backgroundColor: "var(--editorial-bg)", borderColor: NOTE_BORDER, color: NOTE_INK }}
        />
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {tags.map((t, i) => (
              <Tag
                key={t}
                label={t}
                color={TAG_COLORS[i % TAG_COLORS.length]}
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-2 mt-2">
        <button
          type="button"
          onClick={handleAdd}
          className="font-mono text-[13px] tracking-[0.08em] uppercase px-5 py-2 rounded-sm border transition-colors"
          style={{
            borderColor: NOTE_INK,
            color: "#f7f5f0",
            backgroundColor: NOTE_INK,
          }}
        >
          add block ↵
        </button>
        <button
          type="button"
          onClick={onClose}
          className="font-mono text-[13px] tracking-[0.08em] uppercase px-4 py-2 rounded-sm border bg-transparent transition-colors"
          style={{ borderColor: NOTE_BORDER, color: NOTE_INK }}
        >
          cancel
        </button>
      </div>
    </div>
  );
}

type SplitEditorDraft = {
  body: string;
};

type SplitPaneEditorProps = {
  draft: SplitEditorDraft;
  onDraftChange: (next: SplitEditorDraft) => void;
  onSubmit: () => void;
  onClear: () => void;
  hasUnsaved: boolean;
};

const MARKDOWN_BUTTONS: { label: string; title: string; before: string; after: string; block?: boolean }[] = [
  { label: "B", title: "Bold", before: "**", after: "**" },
  { label: "I", title: "Italic", before: "*", after: "*" },
  { label: "S", title: "Strikethrough", before: "~~", after: "~~" },
  { label: "</>", title: "Inline code", before: "`", after: "`" },
  { label: "Link", title: "Link", before: "[", after: "](url)" },
  { label: "•", title: "Bullet list", before: "\n- ", after: "", block: true },
  { label: "1.", title: "Numbered list", before: "\n1. ", after: "", block: true },
  { label: "“", title: "Blockquote", before: "\n> ", after: "", block: true },
  { label: "#", title: "Heading", before: "\n## ", after: "", block: true },
  { label: "```", title: "Code block", before: "\n```\n", after: "\n```", block: true },
];

function SplitPaneEditor({
  draft,
  onDraftChange,
  onSubmit,
  onClear,
  hasUnsaved,
}: SplitPaneEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertMarkdown = (before: string, after: string, block?: boolean) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const scrollTop = ta.scrollTop;
    const scrollLeft = ta.scrollLeft;
    const value = draft.body;
    let newValue: string;
    let newCursor: number;
    if (block) {
      const lineStart = value.slice(0, start).lastIndexOf("\n") + 1;
      newValue = value.slice(0, lineStart) + before + value.slice(lineStart, end) + after + value.slice(end);
      newCursor = lineStart + before.length + (end - lineStart);
    } else {
      const selected = value.slice(start, end);
      newValue = value.slice(0, start) + before + selected + after + value.slice(end);
      newCursor = start + before.length + selected.length;
    }
    onDraftChange({ body: newValue });
    requestAnimationFrame(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(newCursor, newCursor);
      if (textareaRef.current) {
        textareaRef.current.scrollTop = scrollTop;
        textareaRef.current.scrollLeft = scrollLeft;
      }
    });
  };

  const previewHtml = useMemo(() => {
    const raw = draft.body.trim();
    if (!raw) return "";
    return marked.parse(raw) as string;
  }, [draft.body]);

  return (
    <section className="mb-10">
      <header className="flex items-center justify-between mb-3">
        <div className="flex items-baseline gap-2">
          <h2 className="font-mono text-[13px] tracking-[0.1em] uppercase" style={{ color: NOTE_INK }}>
            Today&apos;s note
          </h2>
          {hasUnsaved && (
            <span className="font-mono text-[12px] text-[var(--editorial-accent)]">
              draft saved locally
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onClear}
          className="font-mono text-[13px] bg-transparent cursor-pointer hover:opacity-80"
          style={{ color: NOTE_INK }}
        >
          clear
        </button>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-sm overflow-hidden border md:items-start" style={{ borderColor: NOTE_BORDER }}>
        <div className="border-b md:border-b-0 md:border-r" style={{ backgroundColor: "var(--editorial-bg)", borderColor: NOTE_BORDER }}>
          <div className="flex flex-wrap gap-1 px-2 pt-2 pb-1 border-b" style={{ borderColor: NOTE_BORDER }}>
            {MARKDOWN_BUTTONS.map(({ label, title, before, after, block }) => (
              <button
                key={title}
                type="button"
                title={title}
                onClick={() => insertMarkdown(before, after, block)}
                className="font-mono text-[12px] px-2 py-1 rounded border bg-transparent cursor-pointer hover:opacity-90 transition-opacity"
                style={{ borderColor: NOTE_BORDER, color: NOTE_INK }}
              >
                {label}
              </button>
            ))}
          </div>
          <textarea
            ref={textareaRef}
            value={draft.body}
            onChange={(e) => onDraftChange({ body: e.target.value })}
            placeholder="Write today’s thoughts in markdown — code, links, and learnings welcome."
            className="w-full min-h-[10rem] max-h-60 md:min-h-[12rem] md:max-h-72 bg-transparent text-[15px] leading-[1.6] px-4 py-3 font-mono outline-none resize-y"
            style={{ color: NOTE_INK }}
          />
        </div>
        <div className="px-4 py-3 text-[15px] leading-[1.6] overflow-auto max-h-60 md:max-h-72 min-h-0" style={{ backgroundColor: "var(--editorial-surface)", color: NOTE_INK }}>
          {previewHtml ? (
            <div
              className="prose-editorial prose-editorial-preview"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          ) : (
            <span style={{ color: NOTE_INK_MUTED }}>
              Preview will appear here as you type. Markdown supported: **bold**, *italic*, `code`, [links](url), # headings, lists, blockquotes.
            </span>
          )}
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-2">
        <button
          type="button"
          onClick={onSubmit}
          className="font-mono text-[13px] tracking-[0.08em] uppercase px-5 py-2 rounded-sm border transition-colors hover:opacity-90"
          style={{
            borderColor: NOTE_INK,
            color: "#f7f5f0",
            backgroundColor: NOTE_INK,
          }}
        >
          add as block
        </button>
      </div>
    </section>
  );
}

type DayEntryProps = {
  entry: Entry;
  isToday: boolean;
  activeTag: string | null;
  onBlockDelete: (entryId: string, blockId: string) => void;
  onBlockAdd: (entryId: string, block: Block) => void;
  onBlockUpdate: (entryId: string, blockId: string, payload: { content: string; lang?: string; meta?: string; tags: string[] }) => void;
  onToggleVisibility: (entryId: string) => void;
  onTogglePinned: (entryId: string) => void;
  onCopyDayLink: (entryId: string) => void;
  onCopyBlockLink: (entryId: string, blockId: string) => void;
  copied: boolean;
  initialExpandDate?: string;
};

function DayEntry({
  entry,
  isToday,
  activeTag,
  onBlockDelete,
  onBlockAdd,
  onBlockUpdate,
  onToggleVisibility,
  onTogglePinned,
  onCopyDayLink,
  onCopyBlockLink,
  copied,
  initialExpandDate,
}: DayEntryProps) {
  const [adding, setAdding] = useState(false);
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(entry.date !== initialExpandDate);

  const filteredBlocks = useMemo(
    () =>
      activeTag
        ? entry.blocks.filter((b) => b.tags?.includes(activeTag))
        : entry.blocks,
    [activeTag, entry.blocks],
  );

  if (filteredBlocks.length === 0 && activeTag) return null;

  return (
    <section className="mb-8 border-b border-dashed pb-6" style={{ borderColor: NOTE_BORDER }} aria-label={fmtDate(entry.date)}>
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        className="flex items-center gap-3 w-full text-left group py-2.5"
      >
        <span className="font-mono text-[14px] tracking-[0.08em] uppercase" style={{ color: NOTE_INK }}>
          {isToday ? (collapsed ? "▸ Today" : "▾ Today") : collapsed ? "▸" : "▾"}{" "}
          {!isToday && fmtDate(entry.date)}
        </span>
        <span className="font-mono text-[14px]" style={{ color: NOTE_INK_MUTED }}>
          {filteredBlocks.length} block
          {filteredBlocks.length === 1 ? "" : "s"}
        </span>
        <span className="ml-auto flex items-center gap-2 text-[13px] font-mono" style={{ color: NOTE_INK }}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onTogglePinned(entry.id);
            }}
            aria-label={entry.pinned ? "Unpin day" : "Pin day"}
            className="bg-transparent cursor-pointer rounded-full px-2.5 py-1 border hover:border-[var(--editorial-accent)] hover:text-[var(--editorial-accent)] transition-colors flex items-center gap-1"
            style={{ borderColor: NOTE_BORDER }}
          >
            <span aria-hidden>{entry.pinned ? "★" : "☆"}</span>
            <span>{entry.pinned ? "Pinned" : "Pin"}</span>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleVisibility(entry.id);
            }}
            aria-label={
              entry.visibility === "public"
                ? "Set note to private"
                : "Set note to public"
            }
            className={`bg-transparent cursor-pointer rounded-full px-3 py-1 border text-[12px] tracking-[0.08em] uppercase transition-colors ${
              entry.visibility === "public"
                ? "border-[var(--editorial-accent)] text-[var(--editorial-accent)]"
                : ""
            }`}
            style={
              entry.visibility === "private"
                ? { borderColor: NOTE_BORDER, color: NOTE_INK }
                : undefined
            }
          >
            {entry.visibility === "public" ? "Public" : "Private"}
          </button>
          {entry.visibility === "public" && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onCopyDayLink(entry.id);
              }}
              aria-label="Copy link to this day"
              className="bg-transparent cursor-pointer rounded-full px-2.5 py-1 border hover:border-[var(--editorial-accent)] hover:text-[var(--editorial-accent)] transition-colors flex items-center gap-1"
              style={{ borderColor: NOTE_BORDER }}
            >
              <span aria-hidden>⧉</span>
              <span>{copied ? "Copied" : "Share"}</span>
            </button>
          )}
        </span>
      </button>

      {!collapsed && (
        <div className="mt-2">
          {filteredBlocks.length === 0 && isToday && !adding ? (
            <p className="font-mono text-[15px] mt-3" style={{ color: NOTE_INK_MUTED }}>
              No entries yet today — add a block or use the editor above.
            </p>
          ) : (
            filteredBlocks.map((block) => (
              <BlockRenderer
                key={block.id}
                entryDate={entry.date}
                block={block}
                isEditable={isToday}
                isEditing={editingBlockId === block.id}
                onDelete={() => onBlockDelete(entry.id, block.id)}
                onEdit={() => setEditingBlockId(block.id)}
                onCopyLink={
                  entry.visibility === "public"
                    ? () => onCopyBlockLink(entry.id, block.id)
                    : undefined
                }
                onSaveEdit={(payload) => {
                  onBlockUpdate(entry.id, block.id, payload);
                  setEditingBlockId(null);
                }}
                onCancelEdit={() => setEditingBlockId(null)}
              />
            ))
          )}

          {isToday && (
            <>
              {!adding && (
                <button
                  type="button"
                  onClick={() => setAdding(true)}
                  className="mt-3 font-mono text-[13px] tracking-[0.08em] uppercase px-4 py-2 rounded-sm border bg-transparent hover:border-[var(--editorial-accent)] transition-colors"
                  style={{ borderColor: NOTE_BORDER, color: NOTE_INK }}
                >
                  + add block
                </button>
              )}
              {adding && (
                <AddBlockPanel
                  onAdd={(block) => {
                    onBlockAdd(entry.id, block);
                    setAdding(false);
                  }}
                  onClose={() => setAdding(false)}
                />
              )}
            </>
          )}
        </div>
      )}
    </section>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

type DailyNotesProps = {
  initialExpandDate?: string;
};

export function DailyNotes({ initialExpandDate }: DailyNotesProps = {}) {
  const today = todayStr();

  const [entries, setEntries] = useState<Entry[]>(() => {
    const hasToday = SEED.some((e) => e.date === today);
    const withToday: Entry[] = hasToday
      ? SEED
      : [{ id: uid(), date: today, visibility: "private" as const, pinned: false, blocks: [] }, ...SEED];
    let result = withToday.slice().sort((a, b) => (a.date < b.date ? 1 : -1));
    // when opening a shared link, ensure that date exists so the page shows something
    if (initialExpandDate && !result.some((e) => e.date === initialExpandDate)) {
      result = [
        { id: uid(), date: initialExpandDate, visibility: "private" as const, pinned: false, blocks: [] },
        ...result,
      ].sort((a, b) => (a.date < b.date ? 1 : -1));
    }
    return result;
  });

  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<SplitEditorDraft>({ body: "" });
  const [hasRestorableDraft, setHasRestorableDraft] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);

  const allTagsList = useMemo(() => allTags(entries), [entries]);

  const filteredEntries = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter((e) =>
      e.blocks.some((b) => {
        const contentMatch = b.content.toLowerCase().includes(q);
        const metaMatch = b.meta?.toLowerCase().includes(q);
        const tagMatch = b.tags?.some((t) => t.includes(q));
        return contentMatch || metaMatch || tagMatch;
      }),
    );
  }, [entries, search]);

  // restore local draft on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(localStorageKeyForToday());
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as SplitEditorDraft;
        if (parsed && typeof parsed.body === "string" && parsed.body.trim()) {
          setHasRestorableDraft(true);
        }
      } catch {
        // ignore
      }
    }
  }, []);

  // when opening a shared link with a date (and optional #blockId), expand that day and scroll to block
  useEffect(() => {
    if (!initialExpandDate || typeof window === "undefined") return;
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    const el = document.getElementById(hash);
    if (el) {
      const t = setTimeout(() => {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 300);
      return () => clearTimeout(t);
    }
  }, [initialExpandDate]);

  // autosave draft with debounce
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handle = window.setTimeout(() => {
      window.localStorage.setItem(
        localStorageKeyForToday(),
        JSON.stringify(draft),
      );
    }, 500);
    return () => window.clearTimeout(handle);
  }, [draft]);

  const handleRestoreDraft = () => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(localStorageKeyForToday());
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as SplitEditorDraft;
      if (parsed && typeof parsed.body === "string") {
        setDraft(parsed);
        setHasRestorableDraft(false);
      }
    } catch {
      // ignore
    }
  };

  const handleDiscardDraft = () => {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(localStorageKeyForToday());
    setDraft({ body: "" });
    setHasRestorableDraft(false);
  };

  const todayEntry = entries.find((e) => e.date === today);

  function addBlockToTodayFromDraft() {
    if (!draft.body.trim()) return;
    if (!todayEntry) return;
    const block: Block = {
      id: uid(),
      type: "thought",
      content: draft.body.trim(),
      tags: [],
    };
    setEntries((prev) =>
      prev.map((e) =>
        e.id === todayEntry.id ? { ...e, blocks: [...e.blocks, block] } : e,
      ),
    );
    setDraft({ body: "" });
  }

  function handleBlockAdd(entryId: string, block: Block) {
    setEntries((prev) =>
      prev.map((e) =>
        e.id === entryId ? { ...e, blocks: [...e.blocks, block] } : e,
      ),
    );
  }

  function handleBlockDelete(entryId: string, blockId: string) {
    setEntries((prev) =>
      prev.map((e) =>
        e.id === entryId
          ? { ...e, blocks: e.blocks.filter((b) => b.id !== blockId) }
          : e,
      ),
    );
  }

  function handleBlockUpdate(
    entryId: string,
    blockId: string,
    payload: { content: string; lang?: string; meta?: string; tags: string[] },
  ) {
    setEntries((prev) =>
      prev.map((e) =>
        e.id === entryId
          ? {
              ...e,
              blocks: e.blocks.map((b) =>
                b.id === blockId ? { ...b, ...payload } : b,
              ),
            }
          : e,
      ),
    );
  }

  function handleToggleVisibility(entryId: string) {
    setEntries((prev) =>
      prev.map((e) =>
        e.id === entryId
          ? {
              ...e,
              visibility: e.visibility === "public" ? "private" : "public",
            }
          : e,
      ),
    );
  }

  function handleTogglePinned(entryId: string) {
    setEntries((prev) =>
      prev
        .map((e) =>
          e.id === entryId ? { ...e, pinned: !e.pinned } : e,
        )
        .slice()
        .sort((a, b) => {
          if (a.pinned === b.pinned) {
            return a.date < b.date ? 1 : -1;
          }
          return a.pinned ? -1 : 1;
        }),
    );
  }

  function copyToClipboard(text: string, id: string) {
    if (typeof window === "undefined") return;
    window.navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopiedId(id);
        window.setTimeout(() => setCopiedId(null), 1200);
      })
      .catch(() => {
        // ignore for now
      });
  }

  function handleCopyDayLink(entryId: string) {
    const entry = entries.find((e) => e.id === entryId);
    if (!entry) return;
    const url = `${window.location.origin}/notes/${entry.date}`;
    copyToClipboard(url, `day-${entry.id}`);
  }

  function handleCopyBlockLink(entryId: string, blockId: string) {
    const entry = entries.find((e) => e.id === entryId);
    if (!entry) return;
    const url = `${window.location.origin}/notes/${entry.date}#${blockId}`;
    copyToClipboard(url, `block-${blockId}`);
  }

  return (
    <div className="space-y-8">
      <section
        className="border-y border-dashed py-4 sticky top-0 z-10"
        style={{ backgroundColor: "var(--editorial-bg)", borderColor: NOTE_BORDER }}
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setEditorOpen((open) => !open)}
            className="font-mono text-[13px] tracking-[0.1em] uppercase px-3 py-2 rounded-sm border bg-transparent hover:border-[var(--editorial-accent)] hover:bg-[var(--editorial-accent)] hover:text-[var(--editorial-bg)] transition-colors whitespace-nowrap"
            style={{ borderColor: NOTE_BORDER, color: NOTE_INK }}
          >
            {editorOpen ? "Editor ▾" : "Editor ▸"}
          </button>
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-[14px]" style={{ color: NOTE_INK }}>
              ⌕
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="search notes, tags, code…"
              className="w-full rounded-sm text-[15px] pl-8 pr-4 py-2 font-mono outline-none border placeholder:opacity-80"
              style={{
                backgroundColor: "var(--editorial-bg)",
                borderColor: NOTE_BORDER,
                color: NOTE_INK,
              }}
            />
          </div>
        </div>

        {allTagsList.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {allTagsList.map((t, i) => (
              <Tag
                key={t}
                label={t}
                color={TAG_COLORS[i % TAG_COLORS.length]}
                active={activeTag === t}
                onClick={() =>
                  setActiveTag((prev) => (prev === t ? null : t))
                }
              />
            ))}
          </div>
        )}
      </section>

      {hasRestorableDraft && (
        <div className="border rounded-sm px-4 py-3 flex items-center justify-between gap-4" style={{ borderColor: NOTE_BORDER, backgroundColor: "var(--editorial-surface)" }}>
          <span className="font-mono text-[14px]" style={{ color: NOTE_INK }}>
            Local draft for today found.
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleRestoreDraft}
              className="font-mono text-[13px] tracking-[0.08em] uppercase px-4 py-2 rounded-sm border border-[var(--editorial-text)] text-[var(--editorial-bg)] bg-[var(--editorial-text)] hover:bg-transparent hover:text-[var(--editorial-text)] transition-colors"
            >
              restore
            </button>
            <button
              type="button"
              onClick={handleDiscardDraft}
              className="font-mono text-[13px] tracking-[0.08em] uppercase px-4 py-2 rounded-sm border bg-transparent transition-colors"
              style={{ borderColor: NOTE_BORDER, color: NOTE_INK }}
            >
              discard
            </button>
          </div>
        </div>
      )}

      {editorOpen && (
        <SplitPaneEditor
          draft={draft}
          onDraftChange={setDraft}
          onSubmit={addBlockToTodayFromDraft}
          onClear={handleDiscardDraft}
          hasUnsaved={Boolean(draft.body.trim())}
        />
      )}

      <section aria-label="Notebook entries" className="space-y-4">
        {filteredEntries.length === 0 ? (
          <p className="font-mono text-[15px]" style={{ color: NOTE_INK_MUTED }}>
            no results for &quot;{search}&quot;
          </p>
        ) : (
          filteredEntries.map((entry) => (
            <DayEntry
              key={entry.id}
              entry={entry}
              isToday={entry.date === today}
              activeTag={activeTag}
              onBlockAdd={handleBlockAdd}
              onBlockDelete={handleBlockDelete}
              onBlockUpdate={handleBlockUpdate}
              onToggleVisibility={handleToggleVisibility}
              onTogglePinned={handleTogglePinned}
              onCopyDayLink={handleCopyDayLink}
              onCopyBlockLink={handleCopyBlockLink}
              copied={copiedId === `day-${entry.id}`}
              initialExpandDate={initialExpandDate}
            />
          ))
        )}
      </section>
    </div>
  );
}

