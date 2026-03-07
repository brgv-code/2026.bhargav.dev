import type { CollectionConfig } from "payload";
import { slugs } from "./constants";

function asNumber(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }
  return value;
}

function getRelationId(value: unknown): number | null {
  if (typeof value === "number") return value;
  if (value && typeof value === "object") {
    const maybeId = (value as { id?: unknown }).id;
    if (typeof maybeId === "number") return maybeId;
  }
  return null;
}

export const readingNotesCollection: CollectionConfig = {
  slug: slugs.readingNotes,
  admin: {
    useAsTitle: "date",
    defaultColumns: [
      "date",
      "book",
      "pageStart",
      "pageEnd",
      "pagesRead",
      "updatedAt",
    ],
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
        const pageStart = asNumber(next.pageStart);
        const pageEnd = asNumber(next.pageEnd);

        if (pageStart !== null && pageStart < 1) {
          next.pageStart = 1;
        }
        if (pageEnd !== null && pageEnd < 1) {
          next.pageEnd = 1;
        }

        const safeStart = asNumber(next.pageStart);
        const safeEnd = asNumber(next.pageEnd);
        if (safeStart !== null && safeEnd !== null) {
          if (safeEnd < safeStart) {
            next.pageEnd = safeStart;
          }
          next.pagesRead = Math.max(0, (asNumber(next.pageEnd) ?? safeStart) - safeStart + 1);
        } else if (safeStart !== null) {
          next.pagesRead = 1;
        } else if (safeEnd !== null) {
          next.pagesRead = 1;
        } else {
          next.pagesRead = 0;
        }

        return next;
      },
    ],
    afterChange: [
      async ({ doc, req }) => {
        const bookId = getRelationId(doc?.book);
        const pageEnd = asNumber(doc?.pageEnd);
        if (bookId === null || pageEnd === null) return doc;

        const book = (await req.payload.findByID({
          collection: slugs.books,
          id: bookId,
          depth: 0,
        })) as {
          currentPage?: number | null;
          totalPages?: number | null;
        } | null;

        if (!book) return doc;

        const currentPage = asNumber(book.currentPage) ?? 0;
        if (pageEnd <= currentPage) return doc;

        const totalPages = asNumber(book.totalPages);
        const shouldComplete = totalPages !== null && pageEnd >= totalPages;

        await req.payload.update({
          collection: slugs.books,
          id: bookId,
          data: {
            currentPage: totalPages !== null ? Math.min(pageEnd, totalPages) : pageEnd,
            status: shouldComplete ? "completed" : "reading",
          },
        });

        return doc;
      },
    ],
  },
  fields: [
    {
      name: "book",
      type: "relationship",
      relationTo: slugs.books,
      required: true,
    },
    {
      name: "date",
      type: "text",
      required: true,
      admin: { description: "YYYY-MM-DD" },
    },
    { name: "pageStart", type: "number", required: true, min: 1 },
    { name: "pageEnd", type: "number", required: true, min: 1 },
    {
      name: "pagesRead",
      type: "number",
      required: true,
      defaultValue: 0,
      admin: { readOnly: true, description: "Auto-computed from page range." },
    },
    { name: "thoughts", type: "textarea" },
    {
      name: "habitCompletion",
      type: "relationship",
      relationTo: slugs.habitCompletions,
    },
  ],
};
