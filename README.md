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
4. Jalankan migrasi database. Migrasi awal (`prisma/migrations/20260828042645_init`) sudah dibuat; terapkan dengan:
   ```bash
   node --env-file=.env scripts/apply-init-migration.mjs 20260828042645_init
   ```
   Untuk perubahan skema berikutnya, buat migrasi baru dengan `npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script` diarahkan ke folder migrasi baru, lalu terapkan dengan pola script yang sama (lihat catatan di bawah).
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
- **Koneksi database pakai Neon HTTP driver** (`@prisma/adapter-neon`), bukan koneksi Postgres langsung di port 5432. Di jaringan tempat project ini dibuat, TLS ke port 5432 selalu reset (baik TLS 1.2 maupun 1.3, dari Node maupun `pg`), sementara HTTPS di port 443 normal — jadi `src/lib/prisma.ts` pakai adapter ini agar aplikasi tetap jalan. Konsekuensinya: `npx prisma migrate dev`/`migrate status`/`db pull` tidak akan berfungsi dari mesin dengan kondisi jaringan serupa (CLI-nya tidak lewat adapter). Gunakan `scripts/apply-init-migration.mjs` sebagai pola untuk migrasi berikutnya. Jika dijalankan dari jaringan lain (mis. saat deploy di Vercel) yang tidak kena batasan ini, `prisma migrate deploy` biasa kemungkinan besar akan berfungsi normal.
- `npm audit` melaporkan 1 kerentanan high-severity pada `deepmerge-ts` (dependency dev-only dari Prisma CLI, dieksploitasi lewat stack exhaustion saat merge object rekursif) — tidak berdampak pada runtime aplikasi karena tidak dipakai di `@prisma/client`. Perbaikan penuh butuh downgrade Prisma CLI, jadi untuk saat ini dibiarkan.
