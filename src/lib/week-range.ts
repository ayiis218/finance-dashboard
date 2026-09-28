import { addDays, endOfMonth, startOfMonth } from "date-fns";

/**
 * Week-of-month bucketing for the Transactions week filter: Week 1 = day
 * 1-7, Week 2 = 8-14, Week 3 = 15-21, Week 4 = 22-end of month (absorbs the
 * extra days in 29/30/31-day months). No `week` = the whole month.
 */
export function getWeekRange(
  month: Date,
  week?: 1 | 2 | 3 | 4,
): { from: Date; to: Date } {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  if (!week) return { from: monthStart, to: monthEnd };

  const from = addDays(monthStart, (week - 1) * 7);
  const to = week === 4 ? monthEnd : new Date(Math.min(addDays(from, 6).getTime(), monthEnd.getTime()));
  return { from, to };
}
