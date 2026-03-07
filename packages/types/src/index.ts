import { z } from "zod";

export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string | Record<string, unknown> };

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
};

export const PostSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  publishedAt: z.string().datetime().nullable(),
  tags: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
      })
    )
    .optional(),
});

export type Post = z.infer<typeof PostSchema>;

export const NotebookSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional(),
});

export type Notebook = z.infer<typeof NotebookSchema>;

export const CreateNotebookSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  content: z.string().optional(),
});

export type CreateNotebook = z.infer<typeof CreateNotebookSchema>;

export const NotebookVisibilitySchema = z.enum(["public", "private"]);

export const NotebookBlockTypeSchema = z.enum([
  "thought",
  "code",
  "link",
  "learning",
  "quote",
  "bug",
  "feature",
  "todo",
  "work",
  "note",
  "task",
  "reference",
]);

export const NotebookBlockStatusSchema = z.enum([
  "open",
  "resolved",
  "shipped",
  "todo",
  "in_progress",
  "blocked",
  "done",
]);

export const NotebookBlockSchema = z.object({
  id: z.string().optional(),
  blockId: z.string().optional(),
  block_id: z.string().optional(),
  type: NotebookBlockTypeSchema,
  content: z.string(),
  lang: z.string().nullable().optional(),
  meta: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  tags: z
    .union([z.array(z.string()), z.string()])
    .nullable()
    .optional(),
  status: z
    .union([NotebookBlockStatusSchema, z.string()])
    .nullable()
    .optional(),
  done: z.boolean().nullable().optional(),
});

export const NotebookDocumentSchema = z.object({
  id: z.union([z.string(), z.number()]),
  date: z.string().min(1),
  visibility: NotebookVisibilitySchema,
  pinned: z.boolean().optional(),
  blocks: z.array(NotebookBlockSchema).nullish(),
  updatedAt: z.string().optional(),
  createdAt: z.string().optional(),
});

export type NotebookDocument = z.infer<typeof NotebookDocumentSchema>;

export const NotebookListSchema = z.array(NotebookDocumentSchema);

export const CreateNotebookDocumentSchema = z.object({
  date: z.string().min(1),
  visibility: NotebookVisibilitySchema,
  pinned: z.boolean().optional(),
  blocks: z.array(NotebookBlockSchema).optional(),
});

export type CreateNotebookDocument = z.infer<
  typeof CreateNotebookDocumentSchema
>;

export const UpdateNotebookDocumentSchema =
  CreateNotebookDocumentSchema.partial();
export type UpdateNotebookDocument = z.infer<
  typeof UpdateNotebookDocumentSchema
>;

export const FavoriteItemSchema = z.object({
  id: z.number(),
  type: z
    .enum(["article", "video", "podcast", "book", "tool"])
    .nullable()
    .optional(),
  title: z.string(),
  url: z.string().nullable().optional(),
  source: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  updatedAt: z.string(),
  createdAt: z.string(),
});

export type FavoriteItem = z.infer<typeof FavoriteItemSchema>;

export const FavoritesListSchema = z.array(FavoriteItemSchema);

export const FavoriteSchema = z.object({
  postId: z.string(),
});

export type Favorite = z.infer<typeof FavoriteSchema>;
