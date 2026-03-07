import {
  BookSchema,
  CreateHabitCompletionSchema,
  HabitCompletionsListSchema,
  ReadingNotesListSchema,
  type Book,
  type CreateHabitCompletion,
  type HabitCompletion,
  type ReadingNote,
} from "@repo/types";
import {
  fetchCurrentBookFromPayload,
  fetchHabitCompletionsFromPayload,
  fetchReadingNotesFromPayload,
} from "@/lib/data/cms";

export async function getCurrentBook(): Promise<Book | null> {
  const data = await fetchCurrentBookFromPayload();
  if (!data) return null;
  return BookSchema.parse(data);
}

export async function getReadingNotesByBook(bookId: number): Promise<ReadingNote[]> {
  const data = await fetchReadingNotesFromPayload(bookId);
  return ReadingNotesListSchema.parse(data);
}

export async function getHabitCompletions(limit = 1000): Promise<HabitCompletion[]> {
  const data = await fetchHabitCompletionsFromPayload(limit);
  return HabitCompletionsListSchema.parse(data);
}

export function parseCreateHabitCompletionPayload(
  input: unknown,
): CreateHabitCompletion {
  return CreateHabitCompletionSchema.parse(input);
}
