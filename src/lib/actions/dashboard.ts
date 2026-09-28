"use server";

import { revalidatePath } from "next/cache";
import { captureNetWorthSnapshot } from "@/lib/queries/dashboard";

export async function captureNetWorthSnapshotAction() {
  await captureNetWorthSnapshot();
  revalidatePath("/");
}
