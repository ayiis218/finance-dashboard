import { addMonths, differenceInCalendarMonths } from "date-fns";

export type GoalProjection = {
  monthlyRate: number;
  projectedDate: Date | null;
  status: "achieved" | "on-track" | "behind" | "no-data";
};

/**
 * Proyeksi kapan goal bakal tercapai berdasarkan rata-rata kontribusi
 * historis (total tersimpan / jumlah bulan berjalan sejak `startDate`) —
 * bukan berdasarkan `tenorMonths` (itu target awal, bukan pace aktual).
 * Fungsi murni, tidak query DB — `entries` sudah tersedia di caller.
 */
export function getGoalProjection(goal: {
  targetAmount: number;
  tenorMonths: number;
  startDate: Date;
  entries: { amount: number; month: Date }[];
}): GoalProjection {
  const totalSaved = goal.entries.reduce((sum, e) => sum + e.amount, 0);
  const remaining = goal.targetAmount - totalSaved;

  if (remaining <= 0) {
    return { monthlyRate: 0, projectedDate: null, status: "achieved" };
  }

  const monthsElapsedRaw = differenceInCalendarMonths(new Date(), goal.startDate);
  if (monthsElapsedRaw < 0) {
    // startDate di masa depan — goal belum mulai berjalan, belum ada pace yang bisa diukur.
    return { monthlyRate: 0, projectedDate: null, status: "no-data" };
  }

  // Entri sebelum startDate (pre-funding/salah input) tidak dihitung ke pace —
  // pace cuma representatif kalau diukur dari kontribusi setelah goal resmi mulai.
  const savedSinceStart = goal.entries
    .filter((e) => e.month >= goal.startDate)
    .reduce((sum, e) => sum + e.amount, 0);
  const monthsElapsed = Math.max(1, monthsElapsedRaw);
  const monthlyRate = savedSinceStart / monthsElapsed;

  if (monthlyRate <= 0) {
    return { monthlyRate, projectedDate: null, status: "no-data" };
  }

  const monthsNeeded = Math.ceil(remaining / monthlyRate);
  const projectedDate = addMonths(new Date(), monthsNeeded);
  const deadline = addMonths(goal.startDate, goal.tenorMonths);

  return {
    monthlyRate,
    projectedDate,
    status: projectedDate <= deadline ? "on-track" : "behind",
  };
}
