import type { CollectionConfig } from "payload";
import { slugs } from "./constants";

function asNumber(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }
  return value;
}

export const booksCollection: CollectionConfig = {
  slug: slugs.books,
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "author", "status", "currentPage", "totalPages"],
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (!data || typeof data !== "object") return data;

        const next = data as Record<string, unknown>;
        const totalPages = asNumber(next.totalPages);
        const currentPage = asNumber(next.currentPage);

        if (totalPages !== null) {
          if (currentPage === null || currentPage < 0) {
            next.currentPage = 0;
          } else if (currentPage > totalPages) {
            next.currentPage = totalPages;
          }

          if (next.status === "completed") {
            const safeCurrentPage = asNumber(next.currentPage) ?? 0;
            if (safeCurrentPage < totalPages) {
              next.currentPage = totalPages;
            }
          }

          if ((asNumber(next.currentPage) ?? 0) >= totalPages && totalPages > 0) {
            next.status = "completed";
          }
        } else if (currentPage !== null && currentPage < 0) {
          next.currentPage = 0;
        }

        return next;
      },
    ],
  },
  fields: [
    { name: "title", type: "text", required: true },
    { name: "author", type: "text" },
    { name: "totalPages", type: "number", min: 1 },
    { name: "currentPage", type: "number", required: true, defaultValue: 0, min: 0 },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "reading",
      options: [
        { label: "Reading", value: "reading" },
        { label: "Completed", value: "completed" },
        { label: "Paused", value: "paused" },
        { label: "Wishlist", value: "wishlist" },
      ],
    },
    { name: "coverImage", type: "upload", relationTo: slugs.media },
    { name: "startedAt", type: "date" },
    { name: "finishedAt", type: "date" },
    { name: "summary", type: "textarea" },
  ],
};
