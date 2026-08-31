import { TableSkeleton } from "@/components/skeletons";

export default function TransactionImportLoading() {
  return <TableSkeleton rows={3} cols={2} />;
}