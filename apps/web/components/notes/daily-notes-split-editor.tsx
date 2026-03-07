"use client";

import { useMemo, useRef, useState } from "react";
import { marked } from "marked";
import {
  BLOCK_KINDS,
  MARKDOWN_BUTTONS,
  NOTE_BORDER,
  NOTE_INK,
  NOTE_INK_MUTED,
  QUICK_TEMPLATES,
} from "./daily-notes.constants";
import type { BlockKind, SplitEditorDraft } from "./daily-notes.types";

type SplitPaneEditorProps = {
  draft: SplitEditorDraft;
  onDraftChange: (next: SplitEditorDraft) => void;
  onSubmit: () => void;
  onClear: () => void;
  hasUnsaved: boolean;
};

export function SplitPaneEditor({
  draft,
  onDraftChange,
  onSubmit,
  onClear,
  hasUnsaved,
}: SplitPaneEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [pendingTemplate, setPendingTemplate] = useState<
    (typeof QUICK_TEMPLATES)[number] | null
  >(null);

  const handleTypeChange = (newType: BlockKind) => {
    const template = BLOCK_KINDS[newType].defaultContent;
    onDraftChange({
      ...draft,
      type: newType,
      body:
        !draft.body.trim() && template !== undefined ? template : draft.body,
    });
  };

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
      newValue =
        value.slice(0, lineStart) +
        before +
        value.slice(lineStart, end) +
        after +
        value.slice(end);
      newCursor = lineStart + before.length + (end - lineStart);
    } else {
      const selected = value.slice(start, end);
      newValue =
        value.slice(0, start) + before + selected + after + value.slice(end);
      newCursor = start + before.length + selected.length;
    }
    onDraftChange({ ...draft, body: newValue });
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

  const applyTemplate = (template: (typeof QUICK_TEMPLATES)[number]) => {
    const isTemplateDraft = QUICK_TEMPLATES.some(
      (t) => t.type === draft.type && t.body === draft.body
    );
    if (draft.body.trim() && !isTemplateDraft) {
      setPendingTemplate(template);
      return;
    }
    onDraftChange({
      ...draft,
      type: template.type,
      body: template.body,
    });
  };

  const confirmTemplateReplace = () => {
    if (!pendingTemplate) return;
    onDraftChange({
      ...draft,
      type: pendingTemplate.type,
      body: pendingTemplate.body,
    });
    setPendingTemplate(null);
  };

  return (
    <section className="mb-10">
      <header className="flex items-center justify-between mb-3">
        <div className="flex items-baseline gap-2">
          <h2
            className="font-mono text-[13px] tracking-[0.1em] uppercase"
            style={{ color: NOTE_INK }}
          >
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

      <div className="flex flex-wrap gap-1.5 mb-2">
        {Object.entries(BLOCK_KINDS).map(([k, v]) => {
          const isActive = draft.type === k;
          return (
            <button
              key={k}
              type="button"
              onClick={() => handleTypeChange(k as BlockKind)}
              className="font-mono text-[11px] tracking-[0.06em] uppercase px-2.5 py-1 rounded-sm border transition-colors bg-transparent cursor-pointer"
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
      <div className="flex flex-wrap gap-1.5 mb-3">
        {QUICK_TEMPLATES.map((template) => (
          <button
            key={template.label}
            type="button"
            onClick={() => applyTemplate(template)}
            className="font-mono text-[11px] tracking-[0.04em] uppercase px-2.5 py-1 rounded-sm border bg-transparent cursor-pointer hover:border-[var(--editorial-accent)] transition-colors"
            style={{ borderColor: NOTE_BORDER, color: NOTE_INK }}
          >
            {template.label}
          </button>
        ))}
      </div>
      {pendingTemplate && (
        <div
          className="mb-3 rounded-sm border px-3 py-2 flex items-center justify-between gap-2"
          style={{
            borderColor: NOTE_BORDER,
            backgroundColor: "var(--editorial-surface)",
          }}
        >
          <span className="font-mono text-[12px]" style={{ color: NOTE_INK }}>
            Replace current draft with &quot;{pendingTemplate.label}&quot;?
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={confirmTemplateReplace}
              className="font-mono text-[11px] uppercase tracking-[0.06em] px-2.5 py-1 rounded-sm border"
              style={{
                borderColor: NOTE_INK,
                color: "#f7f5f0",
                backgroundColor: NOTE_INK,
              }}
            >
              replace
            </button>
            <button
              type="button"
              onClick={() => setPendingTemplate(null)}
              className="font-mono text-[11px] uppercase tracking-[0.06em] px-2.5 py-1 rounded-sm border bg-transparent"
              style={{ borderColor: NOTE_BORDER, color: NOTE_INK }}
            >
              keep current
            </button>
          </div>
        </div>
      )}

      <div
        className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-sm overflow-hidden border md:items-start"
        style={{ borderColor: NOTE_BORDER }}
      >
        <div
          className="border-b md:border-b-0 md:border-r"
          style={{
            backgroundColor: "var(--editorial-bg)",
            borderColor: NOTE_BORDER,
          }}
        >
          <div
            className="flex flex-wrap gap-1 px-2 pt-2 pb-1 border-b"
            style={{ borderColor: NOTE_BORDER }}
          >
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
            onChange={(e) => onDraftChange({ ...draft, body: e.target.value })}
            placeholder="Write today's thoughts in markdown — code, links, and learnings welcome."
            className="w-full min-h-[10rem] max-h-60 md:min-h-[12rem] md:max-h-72 bg-transparent text-[15px] leading-[1.6] px-4 py-3 font-mono outline-none resize-y"
            style={{ color: NOTE_INK }}
          />
        </div>
        <div
          className="px-4 py-3 text-[15px] leading-[1.6] overflow-auto max-h-60 md:max-h-72 min-h-0"
          style={{
            backgroundColor: "var(--editorial-surface)",
            color: NOTE_INK,
          }}
        >
          {previewHtml ? (
            <div
              className="prose-editorial prose-editorial-preview"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          ) : (
            <span style={{ color: NOTE_INK_MUTED }}>
              Preview will appear here as you type. Markdown supported:{" "}
              <strong>bold</strong>, <em>italic</em>, <code>code</code>, links,
              headings, lists, blockquotes.
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
