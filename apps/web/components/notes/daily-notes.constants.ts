import type {
  BlockKind,
  BlockKindConfig,
  BlockStatus,
  Entry,
} from "./daily-notes.types";

export const BLOCK_KINDS: Record<BlockKind, BlockKindConfig> = {
  note: {
    label: "note",
    icon: "◈",
    colorVar: "var(--editorial-text)",
    placeholder: "Capture decisions, learnings, and tradeoffs.",
    fields: {},
  },
  code: {
    label: "code",
    icon: "⌥",
    colorVar: "var(--editorial-accent)",
    placeholder:
      "Write notes in markdown; add code in fenced blocks: ```tsx ... ```",
    fields: { lang: true },
  },
  task: {
    label: "task",
    icon: "◔",
    colorVar: "var(--editorial-accent2)",
    placeholder: "Describe the task, bug, feature, or work item.",
    defaultContent: "**Context:** \n**Next step:** ",
    hasLeftBorder: true,
    fields: { status: true },
  },
  reference: {
    label: "reference",
    icon: "↗",
    colorVar: "var(--editorial-accent-strong)",
    placeholder: "Paste a link, quote, doc note, or source summary.",
    hasLeftBorder: true,
    fields: { meta: true },
  },
};

export const TASK_STATUSES: BlockStatus[] = [
  "todo",
  "in_progress",
  "blocked",
  "done",
  "shipped",
];

export const TAG_COLORS = [
  "var(--editorial-accent)",
  "var(--editorial-accent2)",
  "var(--editorial-accent-strong)",
  "var(--editorial-accent-warm)",
  "var(--editorial-text-muted)",
  "var(--editorial-border)",
];

export const NOTE_INK = "#1a1a1a";
export const NOTE_INK_MUTED = "rgba(26, 26, 26, 0.82)";
export const NOTE_BORDER = "rgba(26, 26, 26, 0.28)";

export const MARKDOWN_BUTTONS: {
  label: string;
  title: string;
  before: string;
  after: string;
  block?: boolean;
}[] = [
  { label: "B", title: "Bold", before: "**", after: "**" },
  { label: "I", title: "Italic", before: "*", after: "*" },
  { label: "S", title: "Strikethrough", before: "~~", after: "~~" },
  { label: "</>", title: "Inline code", before: "`", after: "`" },
  { label: "Link", title: "Link", before: "[", after: "](url)" },
  { label: "•", title: "Bullet list", before: "\n- ", after: "", block: true },
  {
    label: "1.",
    title: "Numbered list",
    before: "\n1. ",
    after: "",
    block: true,
  },
  {
    label: "'",
    title: "Blockquote",
    before: "\n> ",
    after: "",
    block: true,
  },
  { label: "#", title: "Heading", before: "\n## ", after: "", block: true },
  {
    label: "```",
    title: "Code block",
    before: "\n```\n",
    after: "\n```",
    block: true,
  },
];

export const QUICK_TEMPLATES: Array<{
  label: string;
  type: BlockKind;
  body: string;
}> = [
  {
    label: "Worklog",
    type: "task",
    body: "**Done:**\n- \n\n**Blocked:**\n- \n\n**Next:**\n- ",
  },
  {
    label: "Debug session",
    type: "task",
    body: "**Issue:**\n\n**Hypothesis:**\n\n**Tried:**\n- \n\n**Outcome:**\n",
  },
  {
    label: "Learning",
    type: "note",
    body: "**What I learned:**\n\n**Why it matters:**\n\n**Apply next in:**\n",
  },
  {
    label: "PR review",
    type: "note",
    body: "**PR:** \n\n**What changed:**\n\n**Risks:**\n\n**Follow-ups:**\n- ",
  },
  {
    label: "Release note",
    type: "note",
    body: "**Shipped:**\n\n**Impact:**\n\n**Rollback plan:**\n",
  },
];

export const SEED: Entry[] =
  process.env.NODE_ENV === "development"
    ? ([
        {
          id: "1",
          date: "2026-03-04",
          visibility: "public",
          pinned: false,
          blocks: [
            {
              id: "b1",
              type: "note",
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
              type: "reference",
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
          pinned: false,
          blocks: [
            {
              id: "b4",
              type: "note",
              content:
                "Turborepo's remote caching is genuinely magic. 8min CI → 40sec after enabling. The graph-aware task scheduling is the real unlock though.",
              tags: ["dx", "monorepo"],
            },
            {
              id: "b5",
              type: "task",
              content:
                "**Done:** Shipped auth flow\n**Blocked:** Waiting on design for dashboard\n**Next:** Start on API integration",
              status: "in_progress",
              tags: [],
            },
            {
              id: "b6",
              type: "reference",
              content:
                "The key question is not 'does it work?' but 'can you understand it six months from now?'",
              meta: "— John Carmack",
              tags: [],
            },
          ],
        },
      ] as Entry[])
    : [];
