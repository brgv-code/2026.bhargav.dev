import type { CollectionConfig } from "payload";
import { slugs } from "./constants";

const BLOCK_TYPES = [
  "thought",
  "code",
  "link",
  "learning",
  "quote",
  "bugs",
  "features",
  "reminders",
  "work",
] as const;

function generateBlockId(): string {
  return `block-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export const notebooksCollection: CollectionConfig = {
  slug: slugs.notebooks,
  admin: { useAsTitle: "date", defaultColumns: ["date", "visibility", "updatedAt"] },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (data?.blocks && Array.isArray(data.blocks)) {
          data.blocks = data.blocks.map((row: { blockId?: string; [key: string]: unknown }) => ({
            ...row,
            blockId: row.blockId?.trim() || generateBlockId(),
          }));
        }
        return data;
      },
    ],
  },
  fields: [
    {
      name: "date",
      type: "text",
      required: true,
      unique: true,
      admin: { description: "YYYY-MM-DD" },
    },
    {
      name: "visibility",
      type: "select",
      required: true,
      defaultValue: "private",
      options: [
        { label: "Public", value: "public" },
        { label: "Private", value: "private" },
      ],
    },
    {
      name: "pinned",
      type: "checkbox",
      defaultValue: false,
    },
    {
      name: "blocks",
      type: "array",
      admin: { description: "Note blocks for this day" },
      fields: [
        {
          name: "blockId",
          type: "text",
          required: false,
          admin: {
            description: "Optional. Auto-generated if left blank (for permalinks).",
          },
        },
        {
          name: "type",
          type: "select",
          required: true,
          options: BLOCK_TYPES.map((v) => ({ label: v, value: v })),
        },
        { name: "content", type: "textarea", required: true },
        { name: "lang", type: "text" },
        { name: "meta", type: "text" },
        {
          name: "tags",
          type: "json",
          admin: { description: "Array of tag strings" },
        },
      ],
    },
  ],
};
