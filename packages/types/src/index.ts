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
  thumbnailUrl: z.string().nullable().optional(),
  source: z.string().nullable().optional(),
  thoughts: z.string().nullable().optional(),
  dateAdded: z.string().nullable().optional(),
  updatedAt: z.string(),
  createdAt: z.string(),
});

export type FavoriteItem = z.infer<typeof FavoriteItemSchema>;

export const FavoritesListSchema = z.array(FavoriteItemSchema);

export const CreateFavoriteItemSchema = z.object({
  type: z.enum(["article", "video", "podcast", "book", "tool"]),
  title: z.string().min(1),
  url: z.string().url().optional().or(z.literal("")).or(z.null()),
  source: z.string().optional().or(z.literal("")).or(z.null()),
  thoughts: z.string().optional().or(z.literal("")).or(z.null()),
});

export type CreateFavoriteItem = z.infer<typeof CreateFavoriteItemSchema>;

export const BookSchema = z.object({
  id: z.number(),
  title: z.string(),
  author: z.string().nullable().optional(),
  totalPages: z.number().nullable().optional(),
  currentPage: z.number().nullable().optional(),
  status: z
    .enum(["reading", "completed", "paused", "wishlist"])
    .nullable()
    .optional(),
  summary: z.string().nullable().optional(),
});

export type Book = z.infer<typeof BookSchema>;

export const ReadingNoteSchema = z.object({
  id: z.number(),
  book: z.union([z.number(), BookSchema]),
  date: z.string(),
  pageStart: z.number(),
  pageEnd: z.number(),
  pagesRead: z.number().nullable().optional(),
  thoughts: z.string().nullable().optional(),
  updatedAt: z.string().optional(),
  createdAt: z.string().optional(),
});

export type ReadingNote = z.infer<typeof ReadingNoteSchema>;

export const ReadingNotesListSchema = z.array(ReadingNoteSchema);

export const HabitKeySchema = z.enum([
  "reading",
  "workout",
  "steps",
  "eating",
  "sleep",
  "coding",
  "editing",
]);

export const HabitCompletionSchema = z.object({
  id: z.number(),
  habitKey: HabitKeySchema,
  date: z.string(),
  completed: z.boolean().nullable().optional(),
  value: z.number().nullable().optional(),
  notes: z.string().nullable().optional(),
  readingNote: z.union([z.number(), ReadingNoteSchema]).nullable().optional(),
  updatedAt: z.string().optional(),
  createdAt: z.string().optional(),
});

export type HabitCompletion = z.infer<typeof HabitCompletionSchema>;

export const HabitCompletionsListSchema = z.array(HabitCompletionSchema);

export const CreateHabitCompletionSchema = z.object({
  habitKey: HabitKeySchema,
  date: z.string().min(1),
  completed: z.boolean().default(true),
  value: z.number().optional(),
  notes: z.string().optional().or(z.null()),
  reading: z
    .object({
      pageStart: z.number().int().min(1),
      pageEnd: z.number().int().min(1),
      thoughts: z.string().optional().or(z.null()),
      bookId: z.number().optional(),
    })
    .optional(),
});

export type CreateHabitCompletion = z.infer<typeof CreateHabitCompletionSchema>;
