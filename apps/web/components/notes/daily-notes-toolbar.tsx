"use client";

import {
  BLOCK_KINDS,
  NOTE_BORDER,
  NOTE_INK,
  TAG_COLORS,
  TASK_STATUSES,
} from "./daily-notes.constants";
import { Tag } from "./daily-notes-block-components";
import type { BlockKind, BlockStatus } from "./daily-notes.types";

type DailyNotesToolbarProps = {
  editorOpen: boolean;
  onToggleEditor: () => void;
  search: string;
  onSearchChange: (value: string) => void;
  allTagsList: string[];
  activeTag: string | null;
  setActiveTag: (value: string | null) => void;
  activeKind: BlockKind | null;
  setActiveKind: (value: BlockKind | null) => void;
  activeStatus: BlockStatus | null;
  setActiveStatus: (value: BlockStatus | null) => void;
  openTasksOnly: boolean;
  setOpenTasksOnly: (value: boolean) => void;
};

export function DailyNotesToolbar({
  editorOpen,
  onToggleEditor,
  search,
  onSearchChange,
  allTagsList,
  activeTag,
  setActiveTag,
  activeKind,
  setActiveKind,
  activeStatus,
  setActiveStatus,
  openTasksOnly,
  setOpenTasksOnly,
}: DailyNotesToolbarProps) {
  return (
    <section
      className="border-y border-dashed py-4 sticky top-0 z-10"
      style={{
        backgroundColor: "var(--editorial-bg)",
        borderColor: NOTE_BORDER,
      }}
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleEditor}
          className="font-mono text-[13px] tracking-[0.1em] uppercase px-3 py-2 rounded-sm border bg-transparent hover:border-[var(--editorial-accent)] hover:bg-[var(--editorial-accent)] hover:text-[var(--editorial-bg)] transition-colors whitespace-nowrap"
          style={{ borderColor: NOTE_BORDER, color: NOTE_INK }}
        >
          {editorOpen ? "Editor ▾" : "Editor ▸"}
        </button>
        <div className="relative flex-1">
          <span
            className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-[14px]"
            style={{ color: NOTE_INK }}
          >
            ⌕
          </span>
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="search notes, tags, categories, code…"
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
              active={activeTag === t && !openTasksOnly}
              onClick={() => {
                setOpenTasksOnly(false);
                setActiveTag(activeTag === t ? null : t);
              }}
            />
          ))}
        </div>
      )}
      <div className="flex flex-wrap gap-1.5 mt-2">
        <Tag
          label="open tasks"
          color="var(--editorial-accent)"
          active={openTasksOnly}
          onClick={() => {
            setOpenTasksOnly(!openTasksOnly);
            setActiveTag(null);
            setActiveKind(null);
            setActiveStatus(null);
          }}
        />
        {Object.entries(BLOCK_KINDS).map(([k]) => (
          <Tag
            key={k}
            label={k}
            color="var(--editorial-border)"
            active={!openTasksOnly && activeKind === k}
            onClick={() => {
              setOpenTasksOnly(false);
              setActiveKind(activeKind === k ? null : (k as BlockKind));
            }}
          />
        ))}
        {TASK_STATUSES.map((s) => (
          <Tag
            key={s}
            label={s.replace("_", " ")}
            color="var(--editorial-border)"
            active={!openTasksOnly && activeStatus === s}
            onClick={() => {
              setOpenTasksOnly(false);
              setActiveStatus(activeStatus === s ? null : s);
            }}
          />
        ))}
        {(activeTag || activeKind || activeStatus || openTasksOnly) && (
          <button
            type="button"
            onClick={() => {
              setActiveTag(null);
              setActiveKind(null);
              setActiveStatus(null);
              setOpenTasksOnly(false);
            }}
            className="font-mono text-[12px] uppercase tracking-[0.06em] rounded-sm px-2.5 py-1 border"
            style={{
              borderColor: NOTE_BORDER,
              color: NOTE_INK,
              backgroundColor: "transparent",
            }}
          >
            clear filters
          </button>
        )}
      </div>
    </section>
  );
}
