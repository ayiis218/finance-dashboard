"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { pickFormFields } from "@/lib/form-data";

const assetSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  value: z.coerce.number(),
  acquiredDate: z.coerce.date(),
});

const ASSET_FIELDS = ["name", "category", "value", "acquiredDate"] as const;

export async function createAsset(formData: FormData) {
  const data = assetSchema.parse(pickFormFields(formData, ASSET_FIELDS));
  await prisma.asset.create({ data });
  revalidatePath("/assets");
  revalidatePath("/");
}

export async function updateAsset(id: string, formData: FormData) {
  const data = assetSchema.parse(pickFormFields(formData, ASSET_FIELDS));
  await prisma.asset.update({ where: { id }, data });
  revalidatePath("/assets");
  revalidatePath("/");
}

export async function deleteAsset(id: string) {
  await prisma.asset.delete({ where: { id } });
  revalidatePath("/assets");
  revalidatePath("/");
}
