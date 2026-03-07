import { z } from "zod";

export const StreakSchema = z.object({
  id: z.string(),
  date: z.string(),
  count: z.number().int().nonnegative(),
});

export type Streak = z.infer<typeof StreakSchema>;
