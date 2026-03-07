import type { CollectionConfig } from "payload";
import { isLoggedIn, slugs } from "./constants";

export const errorLogsCollection: CollectionConfig = {
  slug: slugs.errorLogs,
  admin: {
    useAsTitle: "message",
    defaultColumns: ["occurredAt", "level", "source", "resolved"],
  },
  access: {
    read: isLoggedIn,
    create: () => true,
    update: isLoggedIn,
    delete: isLoggedIn,
  },
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (!data || typeof data !== "object") return data;

        const next = data as Record<string, unknown>;
        const resolved = next.resolved === true;

        if (resolved && !next.resolvedAt) {
          next.resolvedAt = new Date().toISOString();
        }
        if (!resolved) {
          next.resolvedAt = null;
        }
        if (!next.occurredAt) {
          next.occurredAt = new Date().toISOString();
        }

        return next;
      },
    ],
  },
  fields: [
    {
      name: "level",
      type: "select",
      required: true,
      defaultValue: "error",
      options: [
        { label: "Info", value: "info" },
        { label: "Warn", value: "warn" },
        { label: "Error", value: "error" },
        { label: "Fatal", value: "fatal" },
      ],
    },
    { name: "source", type: "text", required: true },
    { name: "message", type: "textarea", required: true },
    { name: "stack", type: "textarea" },
    {
      name: "context",
      type: "json",
      admin: { description: "Additional structured context (route, payload, user agent, etc.)." },
    },
    { name: "occurredAt", type: "date", required: true },
    { name: "resolved", type: "checkbox", defaultValue: false },
    { name: "resolvedAt", type: "date" },
    { name: "resolutionNotes", type: "textarea" },
  ],
};
