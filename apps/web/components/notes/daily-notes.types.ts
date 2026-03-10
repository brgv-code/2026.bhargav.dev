import type { NotebookBlockType } from "@repo/types";

export type BlockKind = NotebookBlockType;

export type PersistedBlockType = BlockKind;

export type BlockStatus =
  | "todo"
  | "in_progress"
  | "blocked"
  | "done"
  | "shipped";

export type Block = {
  id: string;
  type: BlockKind;
  content: string;
  lang?: string;
  meta?: string;
  category?: string;
  tags: string[];
  pinned?: boolean;
  status?: BlockStatus;
};

export type EntryVisibility = "public" | "private";

export type Entry = {
  id: string;
  date: string; // YYYY-MM-DD
  blocks: Block[];
  visibility: EntryVisibility;
  pinned?: boolean;
};

export type BlockKindConfig = {
  label: string;
  icon: string;
  colorVar: string;
  placeholder: string;
  defaultContent?: string;
  hasLeftBorder?: boolean;
  fields: {
    lang?: boolean;
    meta?: boolean;
    status?: boolean;
  };
};

export type NotebookDoc = {
  id: number | string;
  date: string;
  visibility: "public" | "private";
  pinned?: boolean;
  blocks?: Array<{
    id?: string;
    blockId?: string;
    block_id?: string;
    type: PersistedBlockType;
    content: string;
    lang?: string | null;
    meta?: string | null;
    category?: string | null;
    tags?: string[] | string | null;
    status?: string | null;
    done?: boolean | null;
  }> | null;
};

export type BlockSavePayload = {
  content: string;
  lang?: string;
  meta?: string;
  category?: string;
  status?: BlockStatus;
  tags: string[];
};

export type SplitEditorDraft = {
  body: string;
  type: BlockKind;
};
