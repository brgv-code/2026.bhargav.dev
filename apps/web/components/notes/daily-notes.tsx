"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AddBlockPanel,
  BlockFocusModal,
  BlockRenderer,
} from "./daily-notes-block-components";
import {
  NOTE_BORDER,
  NOTE_INK,
  NOTE_INK_MUTED,
  SEED,
} from "./daily-notes.constants";
import {
  entryToNotebookPayload,
  isApiId,
  notebookToEntry,
} from "./daily-notes.transforms";
import { SplitPaneEditor } from "./daily-notes-split-editor";
import { DailyNotesToolbar } from "./daily-notes-toolbar";
import type {
  Block,
  BlockKind,
  BlockStatus,
  Entry,
  NotebookDoc,
  SplitEditorDraft,
} from "./daily-notes.types";
import {
  allTags,
  fmtDate,
  localStorageKeyForToday,
  todayStr,
  uid,
} from "./daily-notes.utils";

type DayEntryProps = {
  entry: Entry;
  canEdit: boolean;
  isToday: boolean;
  activeTag: string | null;
  activeKind: BlockKind | null;
  activeStatus: BlockStatus | null;
  openTasksOnly: boolean;
  onBlockDelete: (entryId: string, blockId: string) => void;
  onBlockAdd: (entryId: string, block: Block) => void;
  onBlockUpdate: (
    entryId: string,
    blockId: string,
    payload: Partial<Block>
  ) => void;
  onToggleVisibility: (entryId: string) => void;
  onTogglePinned: (entryId: string) => void;
  onCopyDayLink: (entryId: string) => void;
  onCopyBlockLink: (entryId: string, blockId: string) => void;
  copied: boolean;
  initialExpandDate?: string;
};

function DayEntry({
  entry,
  canEdit,
  isToday,
  activeTag,
  activeKind,
  activeStatus,
  openTasksOnly,
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
  const [focusBlock, setFocusBlock] = useState<Block | null>(null);
  const [collapsed, setCollapsed] = useState(entry.date !== initialExpandDate);

  const filteredBlocks = useMemo(
    () =>
      entry.blocks.filter((b) => {
        if (activeTag && !b.tags.includes(activeTag)) return false;
        if (activeKind && b.type !== activeKind) return false;
        if (activeStatus && b.status !== activeStatus) return false;
        if (
          openTasksOnly &&
          (b.type !== "task" || b.status === "done" || b.status === "shipped")
        ) {
          return false;
        }
        return true;
      }),
    [activeKind, activeStatus, activeTag, entry.blocks, openTasksOnly]
  );

  if (
    filteredBlocks.length === 0 &&
    (activeTag || activeKind || activeStatus || openTasksOnly)
  ) {
    return null;
  }

  return (
    <section
      className="mb-8 border-b border-dashed pb-6"
      style={{ borderColor: NOTE_BORDER }}
      aria-label={fmtDate(entry.date)}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={() => setCollapsed((c) => !c)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setCollapsed((c) => !c);
          }
        }}
        className="flex items-center gap-3 w-full text-left group py-2.5 cursor-pointer"
      >
        <span
          className="font-mono text-[14px] tracking-[0.08em] uppercase"
          style={{ color: NOTE_INK }}
        >
          {isToday
            ? collapsed
              ? "▸ Today"
              : "▾ Today"
            : collapsed
              ? "▸"
              : "▾"}{" "}
          {!isToday && fmtDate(entry.date)}
        </span>
        <span
          className="font-mono text-[14px]"
          style={{ color: NOTE_INK_MUTED }}
        >
          {filteredBlocks.length} block
          {filteredBlocks.length === 1 ? "" : "s"}
        </span>
        <span
          className="ml-auto flex items-center gap-2 text-[13px] font-mono"
          style={{ color: NOTE_INK }}
          onClick={(e) => e.stopPropagation()}
        >
          {canEdit && (
            <>
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
            </>
          )}
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
      </div>

      {!collapsed && (
        <div className="mt-2">
          {filteredBlocks.length === 0 && isToday && !adding ? (
            <p
              className="font-mono text-[15px] mt-3"
              style={{ color: NOTE_INK_MUTED }}
            >
              No entries yet today — add a block or use the editor above.
            </p>
          ) : (
            filteredBlocks.map((block) => (
              <BlockRenderer
                key={block.id}
                entryDate={entry.date}
                entryId={entry.id}
                block={block}
                isEditable={canEdit && isToday}
                isEditing={editingBlockId === block.id}
                onDelete={() => onBlockDelete(entry.id, block.id)}
                onEdit={() => setEditingBlockId(block.id)}
                onOpenFocus={(_, b) => setFocusBlock(b)}
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
                onStatusChange={(status) =>
                  onBlockUpdate(entry.id, block.id, { status })
                }
              />
            ))
          )}

          {isToday && (
            <>
              {!adding && canEdit && (
                <button
                  type="button"
                  onClick={() => setAdding(true)}
                  className="mt-3 font-mono text-[13px] tracking-[0.08em] uppercase px-4 py-2 rounded-sm border bg-transparent hover:border-[var(--editorial-accent)] transition-colors"
                  style={{ borderColor: NOTE_BORDER, color: NOTE_INK }}
                >
                  + add block
                </button>
              )}
              {adding && canEdit && (
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

      {focusBlock && (
        <BlockFocusModal
          canEdit={canEdit}
          isOpen={true}
          onClose={() => setFocusBlock(null)}
          block={focusBlock}
          entryDate={entry.date}
          onSave={(payload) => {
            onBlockUpdate(entry.id, focusBlock.id, payload);
            setFocusBlock(null);
          }}
          onDelete={() => {
            onBlockDelete(entry.id, focusBlock.id);
            setFocusBlock(null);
          }}
        />
      )}
    </section>
  );
}

type DailyNotesProps = {
  initialExpandDate?: string;
};

export function DailyNotes({ initialExpandDate }: DailyNotesProps = {}) {
  const today = todayStr();

  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [activeKind, setActiveKind] = useState<BlockKind | null>(null);
  const [activeStatus, setActiveStatus] = useState<BlockStatus | null>(null);
  const [openTasksOnly, setOpenTasksOnly] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<SplitEditorDraft>({
    body: "",
    type: "note",
  });
  const [hasRestorableDraft, setHasRestorableDraft] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authInput, setAuthInput] = useState("");

  const entriesRef = useRef<Entry[]>([]);
  useEffect(() => {
    entriesRef.current = entries;
  }, [entries]);

  const ensureRequiredDates = useCallback(
    (list: Entry[]): Entry[] => {
      let result = list;
      if (!result.some((e) => e.date === today)) {
        result = [
          {
            id: uid(),
            date: today,
            visibility: "private",
            pinned: false,
            blocks: [],
          },
          ...result,
        ];
      }
      if (
        initialExpandDate &&
        !result.some((e) => e.date === initialExpandDate)
      ) {
        result = [
          {
            id: uid(),
            date: initialExpandDate,
            visibility: "private",
            pinned: false,
            blocks: [],
          },
          ...result,
        ];
      }
      return result.sort((a, b) => (a.date < b.date ? 1 : -1));
    },
    [today, initialExpandDate]
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetch("/api/notebooks")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { docs?: NotebookDoc[] } | NotebookDoc[] | null) => {
        if (cancelled) return;
        const docs = Array.isArray(data)
          ? data
          : (data as { docs?: NotebookDoc[] })?.docs;
        if (Array.isArray(docs)) {
          setEntries(ensureRequiredDates(docs.map(notebookToEntry)));
        } else {
          setEntries(ensureRequiredDates(SEED.slice()));
        }
      })
      .catch(() => {
        if (!cancelled) setEntries(ensureRequiredDates(SEED.slice()));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [today, initialExpandDate, ensureRequiredDates]);

  const allTagsList = useMemo(() => allTags(entries), [entries]);

  const filteredEntries = useMemo(() => {
    const q = search.trim().toLowerCase();
    const base = entries.filter((e) =>
      e.blocks.some((b) => {
        if (activeTag && !b.tags.includes(activeTag)) return false;
        if (activeKind && b.type !== activeKind) return false;
        if (activeStatus && b.status !== activeStatus) return false;
        if (
          openTasksOnly &&
          (b.type !== "task" || b.status === "done" || b.status === "shipped")
        ) {
          return false;
        }
        if (!q) return true;
        return (
          b.content.toLowerCase().includes(q) ||
          b.meta?.toLowerCase().includes(q) ||
          b.category?.toLowerCase().includes(q) ||
          b.tags.some((t) => t.includes(q))
        );
      })
    );
    return base.slice().sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return a.date < b.date ? 1 : -1;
    });
  }, [activeKind, activeStatus, activeTag, entries, openTasksOnly, search]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(localStorageKeyForToday());
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as SplitEditorDraft;
      if (parsed?.body?.trim()) setHasRestorableDraft(true);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!initialExpandDate || typeof window === "undefined") return;
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    const t = setTimeout(() => {
      document
        .getElementById(hash)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 300);
    return () => clearTimeout(t);
  }, [initialExpandDate]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handle = window.setTimeout(() => {
      window.localStorage.setItem(
        localStorageKeyForToday(),
        JSON.stringify(draft)
      );
    }, 500);
    return () => window.clearTimeout(handle);
  }, [draft]);

  const handleRestoreDraft = () => {
    const raw = window.localStorage.getItem(localStorageKeyForToday());
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as SplitEditorDraft;
      if (parsed?.body) {
        setDraft(parsed);
        setHasRestorableDraft(false);
      }
    } catch {
      // ignore
    }
  };

  const handleDiscardDraft = () => {
    window.localStorage.removeItem(localStorageKeyForToday());
    setDraft({ body: "", type: "note" });
    setHasRestorableDraft(false);
  };

  const canEdit = Boolean(authToken);

  async function persistEntry(entry: Entry) {
    if (!authToken) {
      setShowAuthModal(true);
      return false;
    }
    const payload = entryToNotebookPayload(entry);
    if (isApiId(entry.id)) {
      const res = await fetch(`/api/notebooks/${entry.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-notes-admin-token": authToken,
        },
        body: JSON.stringify(payload),
      });
      return res.ok;
    } else {
      const res = await fetch("/api/notebooks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-notes-admin-token": authToken,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) return false;
      const doc = (await res.json()) as NotebookDoc;
      setEntries((prev) =>
        prev
          .map((e) => (e.id === entry.id ? notebookToEntry(doc) : e))
          .sort((a, b) => (a.date < b.date ? 1 : -1))
      );
      return true;
    }
  }

  function updateEntry(entryId: string, updater: (e: Entry) => Entry) {
    if (!canEdit) return;
    const current = entriesRef.current.find((e) => e.id === entryId);
    if (!current) return;
    const updated = updater(current);
    setEntries((prev) => prev.map((e) => (e.id === entryId ? updated : e)));
    void persistEntry(updated);
  }

  const todayEntry = entries.find((e) => e.date === today);

  function addBlockToTodayFromDraft() {
    if (!canEdit) {
      setShowAuthModal(true);
      return;
    }
    if (!draft.body.trim() || !todayEntry) return;
    const block: Block = {
      id: uid(),
      type: draft.type,
      content: draft.body.trim(),
      tags: [],
    };
    updateEntry(todayEntry.id, (e) => ({
      ...e,
      blocks: [...e.blocks, block],
    }));
    setDraft({ body: "", type: "note" });
  }

  function handleBlockAdd(entryId: string, block: Block) {
    if (!canEdit) {
      setShowAuthModal(true);
      return;
    }
    updateEntry(entryId, (e) => ({ ...e, blocks: [...e.blocks, block] }));
  }

  function handleBlockDelete(entryId: string, blockId: string) {
    if (!canEdit) {
      setShowAuthModal(true);
      return;
    }
    updateEntry(entryId, (e) => ({
      ...e,
      blocks: e.blocks.filter((b) => b.id !== blockId),
    }));
  }

  function handleBlockUpdate(
    entryId: string,
    blockId: string,
    payload: Partial<Block>
  ) {
    if (!canEdit) {
      setShowAuthModal(true);
      return;
    }
    updateEntry(entryId, (e) => ({
      ...e,
      blocks: e.blocks.map((b) =>
        b.id === blockId ? { ...b, ...payload } : b
      ),
    }));
  }

  function handleToggleVisibility(entryId: string) {
    if (!canEdit) {
      setShowAuthModal(true);
      return;
    }
    updateEntry(entryId, (e) => ({
      ...e,
      visibility: e.visibility === "public" ? "private" : "public",
    }));
  }

  function handleTogglePinned(entryId: string) {
    if (!canEdit) {
      setShowAuthModal(true);
      return;
    }
    updateEntry(entryId, (e) => ({ ...e, pinned: !e.pinned }));
  }

  function copyToClipboard(text: string, id: string) {
    if (typeof window === "undefined") return;
    window.navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopiedId(id);
        window.setTimeout(() => setCopiedId(null), 1200);
      })
      .catch(() => {});
  }

  function handleCopyDayLink(entryId: string) {
    const entry = entries.find((e) => e.id === entryId);
    if (!entry) return;
    copyToClipboard(
      `${window.location.origin}/notes/${entry.date}`,
      `day-${entry.id}`
    );
  }

  function handleCopyBlockLink(entryId: string, blockId: string) {
    const entry = entries.find((e) => e.id === entryId);
    if (!entry) return;
    copyToClipboard(
      `${window.location.origin}/notes/${entry.date}#${blockId}`,
      `block-${blockId}`
    );
  }

  return (
    <div className="space-y-8">
      <DailyNotesToolbar
        editorOpen={editorOpen}
        onToggleEditor={() => {
          if (!canEdit) {
            setShowAuthModal(true);
            return;
          }
          setEditorOpen((open) => !open);
        }}
        search={search}
        onSearchChange={setSearch}
        allTagsList={allTagsList}
        activeTag={activeTag}
        setActiveTag={setActiveTag}
        activeKind={activeKind}
        setActiveKind={setActiveKind}
        activeStatus={activeStatus}
        setActiveStatus={setActiveStatus}
        openTasksOnly={openTasksOnly}
        setOpenTasksOnly={setOpenTasksOnly}
      />

      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div
            className="bg-[var(--editorial-surface)] border rounded-sm px-5 py-4 max-w-sm w-full mx-4"
            style={{ borderColor: NOTE_BORDER }}
          >
            <p
              className="font-mono text-[14px] mb-3"
              style={{ color: NOTE_INK }}
            >
              Enter your notes admin password to edit or create notes.
            </p>
            <input
              type="password"
              value={authInput}
              onChange={(e) => setAuthInput(e.target.value)}
              className="w-full rounded-sm text-[14px] px-3 py-2 outline-none border font-mono mb-3"
              style={{
                backgroundColor: "var(--editorial-bg)",
                borderColor: NOTE_BORDER,
                color: NOTE_INK,
              }}
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowAuthModal(false);
                  setAuthInput("");
                }}
                className="font-mono text-[13px] px-3 py-1.5 rounded-sm border bg-transparent cursor-pointer"
                style={{ borderColor: NOTE_BORDER, color: NOTE_INK }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!authInput.trim()) return;
                  setAuthToken(authInput.trim());
                  setAuthInput("");
                  setShowAuthModal(false);
                }}
                className="font-mono text-[13px] px-3 py-1.5 rounded-sm border bg-transparent cursor-pointer"
                style={{ borderColor: NOTE_INK, color: NOTE_INK }}
              >
                Unlock
              </button>
            </div>
          </div>
        </div>
      )}

      {hasRestorableDraft && (
        <div
          className="border rounded-sm px-4 py-3 flex items-center justify-between gap-4"
          style={{
            borderColor: NOTE_BORDER,
            backgroundColor: "var(--editorial-surface)",
          }}
        >
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

      {editorOpen && canEdit && (
        <SplitPaneEditor
          draft={draft}
          onDraftChange={setDraft}
          onSubmit={addBlockToTodayFromDraft}
          onClear={handleDiscardDraft}
          hasUnsaved={Boolean(draft.body.trim())}
        />
      )}

      {loading && (
        <p className="font-mono text-[13px]" style={{ color: NOTE_INK_MUTED }}>
          Loading notes…
        </p>
      )}

      <section aria-label="Notebook entries" className="space-y-4">
        {filteredEntries.length === 0 ? (
          <p
            className="font-mono text-[15px]"
            style={{ color: NOTE_INK_MUTED }}
          >
            {search.trim()
              ? `no results for "${search}"`
              : activeTag || activeKind || activeStatus || openTasksOnly
                ? "No notes match the current filters."
                : "No notes yet. Add a block below or use the editor above."}
          </p>
        ) : (
          filteredEntries.map((entry) => (
            <DayEntry
              key={entry.id}
              entry={entry}
              canEdit={canEdit}
              isToday={entry.date === today}
              activeTag={activeTag}
              activeKind={activeKind}
              activeStatus={activeStatus}
              openTasksOnly={openTasksOnly}
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
