import { TableSkeleton } from "@/components/skeletons";

export default function TransactionsLoading() {
  return <TableSkeleton rows={8} cols={6} />;
}
