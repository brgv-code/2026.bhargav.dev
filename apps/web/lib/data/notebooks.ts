import {
  CreateNotebookDocumentSchema,
  NotebookDocumentSchema,
  NotebookListSchema,
  UpdateNotebookDocumentSchema,
  type CreateNotebookDocument,
  type NotebookDocument,
  type UpdateNotebookDocument,
} from "@repo/types";
import { fetchNotebooks } from "@/lib/data/cms";

export async function getNotebooks(): Promise<NotebookDocument[]> {
  const data = await fetchNotebooks();
  return NotebookListSchema.parse(data);
}

export async function getNotebookByDate(
  date: string
): Promise<NotebookDocument | null> {
  const notebooks = await getNotebooks();
  return notebooks.find((notebook) => notebook.date === date) ?? null;
}

export function parseCreateNotebookPayload(
  input: unknown
): CreateNotebookDocument {
  return CreateNotebookDocumentSchema.parse(input);
}

export function parseUpdateNotebookPayload(
  input: unknown
): UpdateNotebookDocument {
  return UpdateNotebookDocumentSchema.parse(input);
}

export function parseNotebookDocument(input: unknown): NotebookDocument {
  return NotebookDocumentSchema.parse(input);
}
