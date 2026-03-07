import type { CollectionConfig } from "payload";
import { slugs } from "./constants";

const HABIT_OPTIONS = [
  { label: "Reading", value: "reading" },
  { label: "Workout", value: "workout" },
  { label: "10K Steps", value: "steps" },
  { label: "Eating Goal", value: "eating" },
  { label: "Sleep Score", value: "sleep" },
  { label: "Coding", value: "coding" },
  { label: "Editing / Motion", value: "editing" },
];

export const habitCompletionsCollection: CollectionConfig = {
  slug: slugs.habitCompletions,
  admin: {
    useAsTitle: "habitKey",
    defaultColumns: ["habitKey", "date", "completed", "value", "updatedAt"],
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (!data || typeof data !== "object") return data;

        const next = data as Record<string, unknown>;
        const completed = next.completed === true;
        const value =
          typeof next.value === "number" && Number.isFinite(next.value)
            ? next.value
            : null;

        if (completed && value === null) {
          next.value = 1;
        }
        if (!completed && value === null) {
          next.value = 0;
        }

        return next;
      },
    ],
  },
  fields: [
    {
      name: "habitKey",
      type: "select",
      required: true,
      options: HABIT_OPTIONS,
    },
    {
      name: "date",
      type: "text",
      required: true,
      admin: { description: "YYYY-MM-DD" },
    },
    { name: "completed", type: "checkbox", required: true, defaultValue: false },
    {
      name: "value",
      type: "number",
      defaultValue: 0,
      admin: { description: "Numeric progress for the day (pages, steps, score, etc.)." },
    },
    { name: "notes", type: "textarea" },
    {
      name: "readingNote",
      type: "relationship",
      relationTo: slugs.readingNotes,
    },
  ],
};
