import type {
  BlockKind,
  BlockStatus,
  Entry,
  EntryVisibility,
  NotebookDoc,
  PersistedBlockType,
} from "./daily-notes.types";

function normalizeLegacyStatus(
  status: string | null | undefined,
  done: boolean | null | undefined
): BlockStatus | undefined {
  if (done) return "done";
  if (!status) return undefined;
  if (status === "open") return "todo";
  if (status === "resolved") return "done";
  if (status === "shipped") return "shipped";
  if (
    status === "todo" ||
    status === "in_progress" ||
    status === "blocked" ||
    status === "done"
  ) {
    return status;
  }
  return undefined;
}

function normalizeLegacyType(type: PersistedBlockType): BlockKind {
  if (
    type === "code" ||
    type === "task" ||
    type === "note" ||
    type === "reference"
  ) {
    return type;
  }
  if (
    type === "bug" ||
    type === "feature" ||
    type === "todo" ||
    type === "work"
  ) {
    return "task";
  }
  if (type === "link" || type === "quote") return "reference";
  return "note";
}

function parseBlockTags(tags: string[] | string | null | undefined): string[] {
  if (Array.isArray(tags)) return tags;
  if (typeof tags === "string") {
    try {
      const parsed = JSON.parse(tags) as unknown;
      return Array.isArray(parsed) ? (parsed as string[]) : [];
    } catch {
      return [];
    }
  }
  return [];
}

export function notebookToEntry(doc: NotebookDoc): Entry {
  const rawBlocks = doc.blocks ?? [];
  const blocks = rawBlocks.map((b, i) => {
    const blockId = b.blockId ?? (b as { block_id?: string }).block_id ?? b.id;
    const id =
      typeof blockId === "string" && blockId.length > 0
        ? blockId
        : `block-${doc.id}-${i}`;
    return {
      id,
      type: normalizeLegacyType(b.type),
      content: b.content ?? "",
      lang: b.lang ?? undefined,
      meta: b.meta ?? undefined,
      category: b.category?.trim() || undefined,
      tags: parseBlockTags(b.tags),
      status: normalizeLegacyStatus(b.status, b.done),
    };
  });
  return {
    id: String(doc.id),
    date: doc.date,
    visibility: (doc.visibility === "public"
      ? "public"
      : "private") as EntryVisibility,
    pinned: doc.pinned ?? false,
    blocks,
  };
}

export function entryToNotebookPayload(entry: Entry) {
  return {
    date: entry.date,
    visibility: entry.visibility,
    pinned: entry.pinned ?? false,
    blocks: entry.blocks.map((b) => ({
      blockId: b.id,
      type: b.type,
      content: b.content,
      lang: b.lang ?? undefined,
      meta: b.meta ?? undefined,
      category: b.category ?? undefined,
      tags: b.tags ?? [],
      status: b.status ?? undefined,
    })),
  };
}

export function isApiId(id: string): boolean {
  return /^\d+$/.test(id);
}
