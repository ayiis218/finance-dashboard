import { TableSkeleton } from "@/components/skeletons";

export default function AccountsLoading() {
  return <TableSkeleton rows={5} cols={3} />;
}
