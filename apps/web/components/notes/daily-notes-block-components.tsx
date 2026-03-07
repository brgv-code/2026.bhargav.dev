"use client";

import { useEffect, useRef, useState } from "react";
import { CodeBlock } from "./code-block";
import {
  BLOCK_KINDS,
  NOTE_BORDER,
  NOTE_INK,
  NOTE_INK_MUTED,
  TAG_COLORS,
  TASK_STATUSES,
} from "./daily-notes.constants";
import type {
  Block,
  BlockKind,
  BlockSavePayload,
  BlockStatus,
} from "./daily-notes.types";
import {
  fmtDate,
  formatCodeSnippet,
  markdownToHtml,
  splitCodeBlockContent,
  uid,
} from "./daily-notes.utils";

type TagProps = {
  label: string;
  color: string;
  onClick?: () => void;
  active?: boolean;
};

export function Tag({ label, onClick, active }: TagProps) {
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

function BlockContent({ block }: { block: Block }) {
  const cfg = BLOCK_KINDS[block.type];
  const isCode = block.type === "code";
  const isReference = block.type === "reference";
  const contentIsUrl = /^https?:\/\//i.test(block.content.trim());
  const hasLeftBorder = Boolean(cfg.hasLeftBorder);

  if (isCode) {
    return (
      <div className="space-y-3">
        {block.lang && (
          <span
            className="font-mono text-[11px] tracking-[0.15em] uppercase block"
            style={{ color: NOTE_INK }}
          >
            {block.lang}
          </span>
        )}
        {splitCodeBlockContent(block.content, block.lang).map((seg, idx) =>
          seg.type === "markdown" ? (
            <div
              key={idx}
              className="prose-editorial prose-editorial-preview m-0 text-[14px] leading-[1.6]"
              style={{ color: NOTE_INK }}
              dangerouslySetInnerHTML={{ __html: markdownToHtml(seg.content) }}
            />
          ) : (
            <div
              key={idx}
              className="rounded-sm border-l-2 overflow-x-auto text-[14px] leading-[1.6] font-mono"
              style={{ borderColor: "var(--editorial-accent)" }}
            >
              <CodeBlock
                code={seg.content}
                language={seg.lang}
                preClassName="m-0 px-4 py-3"
                className="text-inherit"
              />
            </div>
          )
        )}
      </div>
    );
  }

  if (isReference && contentIsUrl) {
    return (
      <div className="space-y-1">
        <a
          href={block.content}
          target="_blank"
          rel="noreferrer"
          className="font-mono text-[14px] underline-offset-2 hover:underline break-all"
          style={{ color: cfg.colorVar }}
        >
          {block.meta || block.content}
        </a>
        {block.meta && (
          <div
            className="font-mono text-[13px] break-all"
            style={{ color: NOTE_INK_MUTED }}
          >
            {block.content}
          </div>
        )}
      </div>
    );
  }

  if (isReference) {
    return (
      <div
        className="border-l-2 pl-3 space-y-1"
        style={{ borderColor: cfg.colorVar }}
      >
        <div
          className="prose-editorial prose-editorial-preview m-0 text-[15px] leading-[1.6]"
          style={{ color: NOTE_INK }}
          dangerouslySetInnerHTML={{ __html: markdownToHtml(block.content) }}
        />
        {block.meta && (
          <span
            className="font-mono text-[13px]"
            style={{ color: NOTE_INK_MUTED }}
          >
            {block.meta}
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className={`prose-editorial prose-editorial-preview m-0 text-[15px] leading-[1.65] ${
        hasLeftBorder ? "border-l-2 pl-3" : ""
      }`}
      style={{
        color: NOTE_INK,
        ...(hasLeftBorder ? { borderColor: cfg.colorVar } : {}),
      }}
      dangerouslySetInnerHTML={{ __html: markdownToHtml(block.content) }}
    />
  );
}

type BlockEditFormProps = {
  block: Block;
  onSave: (payload: BlockSavePayload) => void;
  onCancel: () => void;
};

export function BlockEditForm({ block, onSave, onCancel }: BlockEditFormProps) {
  const [content, setContent] = useState(block.content);
  const [lang, setLang] = useState(block.lang ?? "");
  const [meta, setMeta] = useState(block.meta ?? "");
  const [category, setCategory] = useState(block.category ?? "");
  const [status, setStatus] = useState<BlockStatus>(block.status ?? "todo");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(block.tags ?? []);

  const commitTag = () => {
    const raw = tagInput.trim().toLowerCase();
    if (!raw || tags.includes(raw)) return;
    setTags((prev) => [...prev, raw]);
    setTagInput("");
  };

  const removeTag = (t: string) =>
    setTags((prev) => prev.filter((x) => x !== t));

  const handleSave = () => {
    const trimmed = content.trim();
    if (!trimmed) return;
    const schema = BLOCK_KINDS[block.type];
    onSave({
      content:
        block.type === "code" && !trimmed.includes("```")
          ? formatCodeSnippet(trimmed)
          : trimmed,
      lang: schema.fields.lang ? lang.trim() || undefined : undefined,
      meta: schema.fields.meta ? meta.trim() || undefined : undefined,
      category: category.trim() || undefined,
      status: schema.fields.status ? status : undefined,
      tags,
    });
  };

  const cfg = BLOCK_KINDS[block.type];
  const isCode = Boolean(cfg.fields.lang);
  const hasMeta = Boolean(cfg.fields.meta);

  return (
    <div
      className="rounded-sm px-4 py-3 mt-2 space-y-3 border border-dashed"
      style={{
        borderColor: NOTE_BORDER,
        backgroundColor: "var(--editorial-surface)",
      }}
    >
      <div className="flex items-center gap-2">
        <span
          className="font-mono text-[14px]"
          style={{ color: NOTE_INK }}
          aria-hidden
        >
          {cfg.icon} edit
        </span>
      </div>
      {isCode && (
        <input
          value={lang}
          onChange={(e) => setLang(e.target.value)}
          placeholder="language (tsx, py, bash…)"
          className="w-full rounded-sm text-[14px] px-3 py-2 outline-none border font-mono"
          style={{
            backgroundColor: "var(--editorial-bg)",
            borderColor: NOTE_BORDER,
            color: NOTE_INK,
          }}
        />
      )}
      {hasMeta && (
        <input
          value={meta}
          onChange={(e) => setMeta(e.target.value)}
          placeholder="source / title / attribution (optional)"
          className="w-full rounded-sm text-[14px] px-3 py-2 outline-none border font-mono"
          style={{
            backgroundColor: "var(--editorial-bg)",
            borderColor: NOTE_BORDER,
            color: NOTE_INK,
          }}
        />
      )}
      <input
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        placeholder="category (optional): debugging, architecture, release..."
        className="w-full rounded-sm text-[14px] px-3 py-2 outline-none border font-mono"
        style={{
          backgroundColor: "var(--editorial-bg)",
          borderColor: NOTE_BORDER,
          color: NOTE_INK,
        }}
      />
      {cfg.fields.status && (
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as BlockStatus)}
          className="w-full rounded-sm text-[14px] px-3 py-2 outline-none border font-mono"
          style={{
            backgroundColor: "var(--editorial-bg)",
            borderColor: NOTE_BORDER,
            color: NOTE_INK,
          }}
        >
          {TASK_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.replace("_", " ")}
            </option>
          ))}
        </select>
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
          style={{
            backgroundColor: "var(--editorial-bg)",
            borderColor: NOTE_BORDER,
            color: NOTE_INK,
          }}
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

export type BlockRendererProps = {
  entryDate: string;
  entryId: string;
  block: Block;
  isEditable: boolean;
  isEditing?: boolean;
  onDelete: () => void;
  onEdit?: () => void;
  onOpenFocus?: (entryId: string, block: Block) => void;
  onCopyLink?: () => void;
  onSaveEdit?: (payload: BlockSavePayload) => void;
  onCancelEdit?: () => void;
  onStatusChange?: (status: BlockStatus) => void;
};

export function BlockRenderer({
  entryDate,
  entryId,
  block,
  isEditable,
  isEditing = false,
  onDelete,
  onEdit,
  onOpenFocus,
  onCopyLink,
  onSaveEdit,
  onCancelEdit,
  onStatusChange,
}: BlockRendererProps) {
  const cfg = BLOCK_KINDS[block.type];

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
        <BlockContent block={block} />

        {block.type === "task" && onStatusChange && (
          <div className="flex gap-1 mt-1">
            {TASK_STATUSES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onStatusChange(s)}
                className="font-mono text-[11px] uppercase tracking-wide px-2 py-0.5 rounded border transition-colors"
                style={{
                  borderColor: block.status === s ? NOTE_INK : NOTE_BORDER,
                  backgroundColor:
                    block.status === s ? NOTE_INK : "transparent",
                  color: block.status === s ? "#f7f5f0" : NOTE_INK,
                }}
              >
                {s.replace("_", " ")}
              </button>
            ))}
          </div>
        )}

        {(block.category || block.tags.length > 0) && (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {block.category && (
              <Tag
                key={`${entryDate}-${block.id}-category`}
                label={`@${block.category}`}
                color="var(--editorial-text-muted)"
              />
            )}
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
        {onOpenFocus && (
          <button
            type="button"
            onClick={() => onOpenFocus(entryId, block)}
            aria-label="Open in focus mode"
            className="font-mono text-[13px] hover:text-[var(--editorial-accent)] transition-colors bg-transparent cursor-pointer px-0.5"
            style={{ color: NOTE_INK }}
          >
            ⊞
          </button>
        )}
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

export type BlockFocusModalProps = {
  isOpen: boolean;
  onClose: () => void;
  block: Block;
  entryDate: string;
  onSave: (payload: BlockSavePayload) => void;
  onDelete: () => void;
};

export function BlockFocusModal({
  isOpen,
  onClose,
  block,
  entryDate,
  onSave,
  onDelete,
}: BlockFocusModalProps) {
  const [editing, setEditing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (editing) setEditing(false);
        else onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, editing, onClose]);

  useEffect(() => {
    if (isOpen && panelRef.current) panelRef.current.focus();
  }, [isOpen]);

  const handleSave = (payload: BlockSavePayload) => {
    onSave(payload);
    setEditing(false);
    onClose();
  };

  const handleDelete = () => {
    onDelete();
    setEditing(false);
    onClose();
  };

  if (!isOpen) return null;

  const cfg = BLOCK_KINDS[block.type];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="block-focus-title"
    >
      <div
        className="absolute inset-0 bg-[var(--editorial-bg)]/80 backdrop-blur-md"
        onClick={() => (editing ? setEditing(false) : onClose())}
        aria-hidden
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        className="relative w-full max-w-2xl max-h-[85vh] overflow-auto mx-4 rounded-sm border border-dashed p-6 focus:outline-none"
        style={{
          backgroundColor: "var(--editorial-surface)",
          borderColor: NOTE_BORDER,
          color: NOTE_INK,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className="font-mono text-[14px] shrink-0"
              style={{ color: cfg.colorVar }}
              aria-hidden
            >
              {cfg.icon}
            </span>
            <span
              id="block-focus-title"
              className="font-mono text-[13px] tracking-[0.08em] uppercase truncate"
              style={{ color: NOTE_INK }}
            >
              {cfg.label} · {fmtDate(entryDate)}
            </span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {!editing && (
              <>
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="font-mono text-[13px] px-3 py-1.5 rounded-sm border bg-transparent cursor-pointer hover:border-[var(--editorial-accent)] transition-colors"
                  style={{ borderColor: NOTE_BORDER, color: NOTE_INK }}
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="font-mono text-[13px] px-3 py-1.5 rounded-sm border bg-transparent cursor-pointer hover:border-[var(--editorial-accent-warm)] transition-colors"
                  style={{ borderColor: NOTE_BORDER, color: NOTE_INK }}
                >
                  Delete
                </button>
              </>
            )}
            <button
              type="button"
              onClick={onClose}
              className="font-mono text-[13px] px-3 py-1.5 rounded-sm border bg-transparent cursor-pointer hover:opacity-90 transition-opacity"
              style={{ borderColor: NOTE_BORDER, color: NOTE_INK }}
              aria-label="Close"
            >
              Close
            </button>
          </div>
        </div>

        {editing ? (
          <BlockEditForm
            block={block}
            onSave={handleSave}
            onCancel={() => setEditing(false)}
          />
        ) : (
          <div className="space-y-2">
            <BlockContent block={block} />
            {(block.category || block.tags.length > 0) && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {block.category && (
                  <span
                    className="font-mono text-[12px] uppercase tracking-wide px-2 py-0.5 rounded border"
                    style={{ borderColor: NOTE_BORDER, color: NOTE_INK }}
                  >
                    @{block.category}
                  </span>
                )}
                {block.tags.map((t) => (
                  <span
                    key={t}
                    className="font-mono text-[12px] uppercase tracking-wide px-2 py-0.5 rounded border"
                    style={{ borderColor: NOTE_BORDER, color: NOTE_INK }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

type AddBlockPanelProps = {
  onAdd: (block: Block) => void;
  onClose: () => void;
};

export function AddBlockPanel({ onAdd, onClose }: AddBlockPanelProps) {
  const [type, setType] = useState<BlockKind>("note");
  const [content, setContent] = useState("");
  const [lang, setLang] = useState("tsx");
  const [meta, setMeta] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState<BlockStatus>("todo");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const handleTypeChange = (newType: BlockKind) => {
    setType(newType);
    const template = BLOCK_KINDS[newType].defaultContent;
    if (template !== undefined && !content.trim()) {
      setContent(template);
    }
  };

  const commitTag = () => {
    const raw = tagInput.trim().toLowerCase();
    if (!raw) return;
    if (!tags.includes(raw)) setTags((prev) => [...prev, raw]);
    setTagInput("");
  };

  const handleAdd = () => {
    if (!content.trim()) return;
    const schema = BLOCK_KINDS[type];
    const finalContent =
      type === "code" && !content.includes("```")
        ? formatCodeSnippet(content)
        : content;
    onAdd({
      id: uid(),
      type,
      content: finalContent,
      lang: schema.fields.lang ? lang : undefined,
      meta: schema.fields.meta ? meta : undefined,
      category: category.trim() || undefined,
      tags,
      status: schema.fields.status ? status : undefined,
    });
    setContent("");
    setMeta("");
    setCategory("");
    setTagInput("");
    setTags([]);
  };

  const schema = BLOCK_KINDS[type];
  const placeholder = schema.placeholder;

  return (
    <div
      className="rounded-sm px-4 py-4 mt-3 space-y-3"
      style={{
        backgroundColor: "var(--editorial-surface)",
        border: `1px solid ${NOTE_BORDER}`,
      }}
    >
      <div className="flex flex-wrap gap-2">
        {Object.entries(BLOCK_KINDS).map(([k, v]) => {
          const isActive = type === k;
          return (
            <button
              key={k}
              type="button"
              onClick={() => handleTypeChange(k as BlockKind)}
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

      {schema.fields.lang && (
        <input
          value={lang}
          onChange={(e) => setLang(e.target.value)}
          placeholder="language (tsx, py, bash…)"
          className="w-full rounded-sm text-[15px] px-3 py-2 outline-none border"
          style={{
            backgroundColor: "var(--editorial-bg)",
            borderColor: NOTE_BORDER,
            color: NOTE_INK,
          }}
        />
      )}

      {schema.fields.meta && (
        <input
          value={meta}
          onChange={(e) => setMeta(e.target.value)}
          placeholder="source / title / attribution (optional)"
          className="w-full rounded-sm text-[15px] px-3 py-2 outline-none border"
          style={{
            backgroundColor: "var(--editorial-bg)",
            borderColor: NOTE_BORDER,
            color: NOTE_INK,
          }}
        />
      )}
      <input
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        placeholder="category (optional): debugging, architecture, release..."
        className="w-full rounded-sm text-[15px] px-3 py-2 outline-none border"
        style={{
          backgroundColor: "var(--editorial-bg)",
          borderColor: NOTE_BORDER,
          color: NOTE_INK,
        }}
      />
      {schema.fields.status && (
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as BlockStatus)}
          className="w-full rounded-sm text-[15px] px-3 py-2 outline-none border"
          style={{
            backgroundColor: "var(--editorial-bg)",
            borderColor: NOTE_BORDER,
            color: NOTE_INK,
          }}
        >
          {TASK_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.replace("_", " ")}
            </option>
          ))}
        </select>
      )}

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        rows={type === "code" || type === "task" ? 6 : 3}
        className="w-full rounded-sm text-[15px] leading-[1.55] px-3 py-2 outline-none resize-vertical border"
        style={{
          backgroundColor: "var(--editorial-bg)",
          borderColor: NOTE_BORDER,
          color: NOTE_INK,
          fontFamily: schema.fields.lang
            ? "var(--font-mono, ui-monospace)"
            : "",
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
          style={{
            backgroundColor: "var(--editorial-bg)",
            borderColor: NOTE_BORDER,
            color: NOTE_INK,
          }}
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
