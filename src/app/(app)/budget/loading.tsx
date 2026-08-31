import { TableSkeleton } from "@/components/skeletons";

export default function BudgetLoading() {
  return (
    <div className="space-y-4">
      <TableSkeleton rows={4} cols={3} />
      <TableSkeleton rows={6} cols={7} />
    </div>
  );
}
