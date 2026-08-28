# Finance Dashboard

Dashboard pencatatan keuangan pribadi: saldo, aset, utang/piutang, investasi, savings goal (wedding, eid, dll), ringkasan harian, dan chart perbandingan pengeluaran bulanan.

## Tech Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4 + shadcn/ui
- Prisma 6 + PostgreSQL (Supabase / Neon)
- Auth.js (NextAuth) v5 dengan Google provider
- Recharts

## Setup

1. **Database** — buat project Postgres di [Supabase](https://supabase.com) atau [Neon](https://neon.tech), lalu salin connection string-nya.
2. **Google OAuth** — buat OAuth Client ID di [Google Cloud Console](https://console.cloud.google.com/apis/credentials), tambahkan redirect URI: `http://localhost:3000/api/auth/callback/google` (sesuaikan domain saat deploy).
3. Salin `.env.example` ke `.env` dan isi:
   ```
   DATABASE_URL=...
   AUTH_SECRET=...        # generate dengan: npx auth secret
   AUTH_GOOGLE_ID=...
   AUTH_GOOGLE_SECRET=...
   ALLOWED_EMAIL=...      # email Anda, agar hanya Anda yang bisa login
   ```
4. Jalankan migrasi database:
   ```bash
   npx prisma migrate dev --name init
   ```
5. Jalankan dev server:
   ```bash
   npm run dev
   ```

## Struktur Fitur

| Halaman | Fungsi |
|---|---|
| `/` | Dashboard: total saldo/aset/investasi/utang, net worth, ringkasan harian, chart pengeluaran bulanan |
| `/transactions` | Catat transaksi harian (income/expense/transfer), otomatis update saldo rekening |
| `/accounts` | Kelola rekening bank & cash |
| `/assets` | Kelola aset (properti, kendaraan, barang) |
| `/investments` | Kelola investasi per platform dengan perhitungan return otomatis |
| `/receivables` | Catat piutang & utang per orang |
| `/goals` | Savings goal (wedding, eid, dll) dengan progress bar & tracking tabungan bulanan |
| `/reports` | Chart pengeluaran per kategori & alokasi investasi |

## Catatan

- Aplikasi ini single-user: login dibatasi hanya untuk email di `ALLOWED_EMAIL`.
- `npm audit` melaporkan 1 kerentanan high-severity pada `deepmerge-ts` (dependency dev-only dari Prisma CLI, dieksploitasi lewat stack exhaustion saat merge object rekursif) — tidak berdampak pada runtime aplikasi karena tidak dipakai di `@prisma/client`. Perbaikan penuh butuh downgrade Prisma CLI, jadi untuk saat ini dibiarkan.
