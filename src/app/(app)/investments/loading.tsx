import { TableSkeleton } from "@/components/skeletons";

export default function InvestmentsLoading() {
  return <TableSkeleton rows={5} cols={5} />;
}
