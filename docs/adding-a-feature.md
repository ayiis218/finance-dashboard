# Menambah Domain / Fitur Baru

Panduan ini mengikuti pola yang sudah dipakai 9 domain lain di project ini (accounts, transactions, assets, investments, receivables, budget, cashflow, goals). Ikuti urutannya supaya struktur tetap konsisten dan tidak ada langkah yang terlewat.

Sebagai contoh, anggap kita mau menambah domain **`subscriptions`** (langganan bulanan).

---

## 1. Model database

Tambahkan model di `prisma/schema.prisma`:

```prisma
model Subscription {
  id        String   @id @default(cuid())
  name      String
  amount    Decimal  @db.Decimal(15, 2)
  dueDate   DateTime
  createdAt DateTime @default(now())
}
```

Lalu buat & terapkan migrasi. **Jangan pakai `prisma migrate dev`** — koneksi Postgres langsung tidak jalan di jaringan tempat project ini dikembangkan (lihat catatan di README). Pakai pola script yang sudah ada:

```bash
node --env-file=.env scripts/apply-init-migration.mjs <nama_folder_migrasi>
```

Regenerate Prisma Client:

```bash
npx prisma generate
```

---

## 2. Query layer — `src/lib/queries/subscriptions.ts`

Semua **baca data** tinggal di sini. Halaman tidak boleh memanggil `prisma` langsung.

```ts
import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/queries/shared";

export async function getSubscriptions() {
  return prisma.subscription.findMany({ orderBy: { dueDate: "asc" } });
}
```

Pakai `toNumber()` dari `@/lib/queries/shared` kalau perlu mengubah kolom `Decimal` jadi `number` (kolom nullable otomatis jadi `0`).

Tambahkan JSDoc **hanya** kalau ada aturan bisnis yang tidak kelihatan dari nama fungsi — misalnya status yang diturunkan dari beberapa kolom, atau baris yang sengaja tidak ikut dihitung.

---

## 3. Action layer — `src/lib/actions/subscriptions.ts`

Semua **tulis data**. File wajib diawali `"use server"`.

```ts
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { pickFormFields } from "@/lib/form-data";

const subscriptionSchema = z.object({
  name: z.string().min(1),
  amount: z.coerce.number().positive(),
  dueDate: z.coerce.date(),
});

const SUBSCRIPTION_FIELDS = ["name", "amount", "dueDate"] as const;

export async function createSubscription(formData: FormData) {
  const data = subscriptionSchema.parse(pickFormFields(formData, SUBSCRIPTION_FIELDS));
  await prisma.subscription.create({ data });
  revalidatePath("/subscriptions");
  revalidatePath("/");
}

export async function updateSubscription(id: string, formData: FormData) {
  const data = subscriptionSchema.parse(pickFormFields(formData, SUBSCRIPTION_FIELDS));
  await prisma.subscription.update({ where: { id }, data });
  revalidatePath("/subscriptions");
  revalidatePath("/");
}

export async function deleteSubscription(id: string) {
  await prisma.subscription.delete({ where: { id } });
  revalidatePath("/subscriptions");
  revalidatePath("/");
}
```

Catatan penting:

- Deklarasikan daftar field **sekali** sebagai konstanta `as const`, lalu pakai ulang di create & update.
- `revalidatePath("/")` hanya perlu kalau data domain ini ikut memengaruhi angka di dashboard.
- Kalau satu mutasi menyentuh lebih dari satu tabel (mis. mengubah saldo rekening), bungkus dengan `prisma.$transaction()` — lihat `src/lib/actions/transactions.ts` sebagai contoh.

---

## 4. Komponen — `src/components/subscriptions/`

### `subscription-form-fields.tsx`

Field form yang dipakai **bersama** oleh dialog create dan edit. Terima `idPrefix` (supaya `id` input unik saat ada banyak dialog di satu halaman) dan `defaults` opsional:

```tsx
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { NumberInput } from "@/components/number-input";

export type SubscriptionFormDefaults = { name?: string; amount?: number; dueDate?: string };

export function SubscriptionFormFields({
  idPrefix,
  defaults,
}: Readonly<{ idPrefix: string; defaults?: SubscriptionFormDefaults }>) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor={`name-${idPrefix}`}>Name</Label>
        <Input id={`name-${idPrefix}`} name="name" defaultValue={defaults?.name} required />
      </div>
      {/* field lain... */}
    </>
  );
}
```

Pakai `NumberInput` (bukan `Input type="number"`) untuk nominal rupiah — komponen itu menampilkan pemisah ribuan tapi tetap mengirim angka polos ke `FormData`.

### `subscription-table.tsx`

Turunkan tipe baris dari query, jangan tulis ulang:

```tsx
import type { getSubscriptions } from "@/lib/queries/subscriptions";

type SubscriptionRow = Awaited<ReturnType<typeof getSubscriptions>>[number];
```

Strukturnya dua bagian — tabel untuk desktop, kartu untuk mobile:

```tsx
function SubscriptionRowActions({ item }: Readonly<{ item: SubscriptionRow }>) {
  return (
    <>
      <FormDialog
        title="Edit Subscription"
        triggerIcon={<Pencil className="size-4" />}
        triggerVariant="ghost"
        triggerSize="icon"
        action={updateSubscription.bind(null, item.id)}
      >
        <SubscriptionFormFields idPrefix={item.id} defaults={{ name: item.name }} />
      </FormDialog>
      <DeleteButton action={deleteSubscription.bind(null, item.id)} />
    </>
  );
}

export function SubscriptionTable({ rows }: Readonly<{ rows: SubscriptionRow[] }>) {
  return (
    <>
      <div className="hidden sm:block">{/* <Table> ... </Table> */}</div>
      <MobileCardList>{/* <MobileRowCard> ... </MobileRowCard> */}</MobileCardList>
    </>
  );
}
```

Komponen bersama yang dipakai di sini: `FormDialog`, `DeleteButton`, dan keluarga `MobileCardList` / `MobileRowCard` / `MobileRowField` / `MobileRowHeader` / `MobileRowActions` / `MobileEmptyState` dari `@/components/mobile-row-card`. Jangan bikin versi sendiri.

---

## 5. Halaman — `src/app/(app)/subscriptions/page.tsx`

```tsx
export const dynamic = "force-dynamic";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FormDialog } from "@/components/form-dialog";
import { SummaryStats } from "@/components/summary-stats";
import { SubscriptionFormFields } from "@/components/subscriptions/subscription-form-fields";
import { SubscriptionTable } from "@/components/subscriptions/subscription-table";
import { getSubscriptions } from "@/lib/queries/subscriptions";
import { createSubscription } from "@/lib/actions/subscriptions";
import { formatIDR } from "@/lib/format";

export default async function SubscriptionsPage() {
  const subscriptions = await getSubscriptions();
  const total = subscriptions.reduce((sum, s) => sum + Number(s.amount), 0);

  return (
    <div className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-1 duration-300">
      <SummaryStats items={[{ label: "Total Monthly", value: formatIDR(total), tone: "highlight" }]} />
      <Card>
        <CardHeader className="flex flex-col gap-3 bg-gradient-to-r from-primary/5 to-transparent sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Subscriptions</CardTitle>
          <FormDialog title="Add Subscription" triggerLabel="Add" action={createSubscription}>
            <SubscriptionFormFields idPrefix="new" />
          </FormDialog>
        </CardHeader>
        <CardContent>
          <SubscriptionTable rows={subscriptions} />
        </CardContent>
      </Card>
    </div>
  );
}
```

Kalau butuh beberapa query sekaligus, bungkus dengan `Promise.all` supaya jalan paralel:

```ts
const [subscriptions, summary] = await Promise.all([getSubscriptions(), getSummary()]);
```

Tambahkan juga `loading.tsx` di folder yang sama, pakai skeleton dari `@/components/skeletons`.

---

## 6. Daftarkan route & menu

`src/lib/registry/route.ts`:

```ts
export const ROUTES = {
  // ...
  subscriptions: "/subscriptions",
};
```

`src/lib/registry/nav-items.ts`:

```ts
{ show: true, title: "Subscriptions", url: ROUTES.subscriptions, icon: CalendarClock },
```

Bottom nav mobile (`src/components/bottom-nav.tsx`) sengaja dibatasi 5 item — hanya ubah kalau menu baru memang lebih sering dipakai daripada salah satu yang sudah ada.

---

## 7. Verifikasi sebelum selesai

```bash
npx tsc --noEmit -p .
npx eslint src
npx next build
```

Ketiganya harus bersih. Setelah itu baru cek manual di browser: create, edit, delete, tampilan mobile (lebar ~390px), dan pastikan angka di dashboard ikut terupdate kalau domain ini memengaruhinya.
