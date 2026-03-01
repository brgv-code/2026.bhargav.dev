import type { Block } from "payload";
import { slugs } from "./constants";

export function extractPlainText(content: unknown): string {
  if (!content || typeof content !== "object") return "";
  const root = (content as { root?: unknown }).root;
  if (!root) return "";

  function walk(node: unknown): string {
    if (!node || typeof node !== "object") return "";
    const n = node as Record<string, unknown>;

    if (n.type === "text") return (n.text as string) ?? "";
    if (n.type === "linebreak") return " ";
    if (n.blockType === "code") return "";
    if (n.type === "code") {
      return Array.isArray(n.children)
        ? (n.children as unknown[]).map(walk).join("")
        : "";
    }

    const childText = Array.isArray(n.children)
      ? (n.children as unknown[]).map(walk).join("")
      : "";
    const blockTypes = ["paragraph", "heading", "listitem", "quote", "root"];
    if (blockTypes.includes((n.type as string) ?? "")) return childText + " ";

    return childText;
  }

  return walk(root).replace(/\s+/g, " ").trim();
}

export const codeBlock: Block = {
  slug: "code",
  labels: { singular: "Code block", plural: "Code blocks" },
  fields: [
    {
      name: "language",
      type: "select",
      defaultValue: "typescript",
      options: [
        { label: "TypeScript", value: "typescript" },
        { label: "JavaScript", value: "javascript" },
        { label: "TSX", value: "tsx" },
        { label: "JSX", value: "jsx" },
        { label: "Python", value: "python" },
        { label: "Rust", value: "rust" },
        { label: "Go", value: "go" },
        { label: "Bash / Shell", value: "bash" },
        { label: "SQL", value: "sql" },
        { label: "JSON", value: "json" },
        { label: "YAML", value: "yaml" },
        { label: "CSS", value: "css" },
        { label: "HTML", value: "html" },
        { label: "Markdown", value: "markdown" },
        { label: "Plaintext", value: "plaintext" },
      ],
    },
    {
      name: "code",
      type: "code",
      required: true,
      admin: {
        language: "typescript",
      },
    },
    {
      name: "filename",
      type: "text",
      admin: {
        description: "Optional. Shown as a label above the code block.",
        placeholder: "e.g. apps/web/lib/utils.ts",
      },
    },
    {
      name: "highlight_lines",
      type: "text",
      admin: {
        description:
          "Optional. Comma-separated line numbers or ranges to highlight. e.g. 1,3,5-8",
        placeholder: "1,3,5-8",
      },
    },
  ],
};

export const calloutBlock: Block = {
  slug: "callout",
  labels: { singular: "Callout", plural: "Callouts" },
  fields: [
    {
      name: "type",
      type: "select",
      defaultValue: "info",
      required: true,
      options: [
        { label: "💡 Tip", value: "tip" },
        { label: "ℹ️ Info", value: "info" },
        { label: "⚠️ Warning", value: "warning" },
        { label: "🚨 Danger", value: "danger" },
      ],
    },
    {
      name: "title",
      type: "text",
      admin: {
        description: "Optional. Bold heading shown above the callout body.",
      },
    },
    {
      name: "content",
      type: "textarea",
      required: true,
    },
  ],
};

export const videoEmbedBlock: Block = {
  slug: "videoEmbed",
  labels: { singular: "Video embed", plural: "Video embeds" },
  fields: [
    {
      name: "url",
      type: "text",
      required: true,
      admin: {
        description: "YouTube, Vimeo, or direct .mp4 URL.",
        placeholder: "https://youtube.com/watch?v=...",
      },
    },
    {
      name: "caption",
      type: "text",
    },
    {
      name: "autoplay",
      type: "checkbox",
      defaultValue: false,
      label: "Autoplay (direct video files only)",
    },
  ],
};

export const imageGalleryBlock: Block = {
  slug: "imageGallery",
  labels: { singular: "Image gallery", plural: "Image galleries" },
  fields: [
    {
      name: "images",
      type: "array",
      minRows: 2,
      fields: [
        {
          name: "image",
          type: "upload",
          relationTo: slugs.media,
          required: true,
        },
        {
          name: "caption",
          type: "text",
        },
      ],
    },
    {
      name: "layout",
      type: "select",
      defaultValue: "grid",
      options: [
        { label: "Grid", value: "grid" },
        { label: "Carousel", value: "carousel" },
        { label: "Masonry", value: "masonry" },
      ],
    },
  ],
};

export const sandpackBlock: Block = {
  slug: "sandpack",
  labels: { singular: "Sandpack playground", plural: "Sandpack playgrounds" },
  fields: [
    {
      name: "code",
      type: "code",
      required: true,
    },
    {
      name: "template",
      type: "select",
      defaultValue: "react",
      options: [
        { label: "React", value: "react" },
        { label: "React + TypeScript", value: "react-ts" },
        { label: "Node", value: "node" },
        { label: "Vanilla JS", value: "vanilla" },
      ],
    },
    {
      name: "dependencies",
      type: "array",
      admin: {
        description: "npm packages to inject into the Sandpack environment.",
      },
      fields: [
        { name: "name", type: "text", required: true },
        {
          name: "version",
          type: "text",
          admin: { placeholder: "latest" },
        },
      ],
    },
    {
      name: "show_preview",
      type: "checkbox",
      defaultValue: true,
      label: "Show live preview panel",
    },
  ],
};

export const aiPlaygroundBlock: Block = {
  slug: "aiPlayground",
  labels: { singular: "AI playground", plural: "AI playgrounds" },
  fields: [
    {
      name: "system_prompt",
      type: "textarea",
      admin: {
        description: "Sets the AI's role and behaviour for this playground.",
        placeholder: "You are a helpful assistant that...",
      },
    },
    {
      name: "initial_user_prompt",
      type: "textarea",
      admin: {
        description:
          "Pre-fills the first user message. Leave blank for an empty input.",
      },
    },
    {
      name: "model",
      type: "select",
      defaultValue: "claude-sonnet-4-20250514",
      options: [
        { label: "Claude Sonnet 4", value: "claude-sonnet-4-20250514" },
        { label: "Claude Opus 4", value: "claude-opus-4-20250514" },
        { label: "GPT-4o", value: "gpt-4o" },
      ],
    },
  ],
};

export const dividerBlock: Block = {
  slug: "divider",
  labels: { singular: "Divider", plural: "Dividers" },
  fields: [
    {
      name: "label",
      type: "text",
      admin: {
        description: "Optional text label shown in the centre of the divider.",
        placeholder: "e.g. · · ·",
      },
    },
  ],
};
