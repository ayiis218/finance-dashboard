import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/queries/shared";

export type ReceivableStatus = "UNPAID" | "PARTIALLY_PAID" | "SETTLED";

/**
 * Status is derived, not stored: a row counts as SETTLED when it was marked
 * settled manually *or* its payments already cover the full amount, and as
 * PARTIALLY_PAID once any payment exists. `remaining` is floored at 0 so an
 * overpayment never reports negative outstanding.
 */
export async function getReceivablesWithStatus() {
  const receivables = await prisma.receivable.findMany({
    include: { payments: { orderBy: { date: "desc" } } },
    orderBy: [{ isSettled: "asc" }, { date: "desc" }],
  });

  return receivables.map((r) => {
    const amount = toNumber(r.amount);
    const totalPaid = r.payments.reduce((sum, p) => sum + toNumber(p.amount), 0);
    const remaining = Math.max(0, amount - totalPaid);
    let status: ReceivableStatus = "UNPAID";
    if (r.isSettled || totalPaid >= amount) status = "SETTLED";
    else if (totalPaid > 0) status = "PARTIALLY_PAID";

    return { ...r, totalPaid, remaining, status };
  });
}
