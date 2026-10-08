# Database Migrations

## Kenapa `prisma migrate dev`/`db push` gagal di sini

Di environment sandbox Claude Code ini, Prisma CLI gagal connect ke Neon dengan:

```
Error: P1011: Error opening a TLS connection: connection closed via error
```

Ini terjadi untuk `prisma migrate dev`, `prisma migrate deploy`, dan `prisma db push` — semuanya butuh koneksi TCP langsung (port 5432) ke Neon pooler, dan koneksi itu diblokir di jaringan sandbox ini. Ini bukan masalah kredensial/konfigurasi `DATABASE_URL` — `prisma generate` (yang tidak butuh koneksi DB) selalu jalan normal, dan app sendiri bisa baca/tulis DB dengan lancar saat runtime karena memakai `@prisma/adapter-neon` (`src/lib/prisma.ts`), yaitu driver HTTP/WebSocket Neon, bukan koneksi TCP biasa.

**Kalau kamu menjalankan Claude Code di luar sandbox ini** (laptop sendiri, CI runner, environment lain yang tidak memblokir port 5432) — `prisma migrate dev` kemungkinan besar jalan normal. Coba itu dulu sebelum pakai proses manual di bawah.

## Proses manual (fallback, dipakai berkali-kali di environment ini)

1. **Tulis `migration.sql`-nya sendiri**, di folder bernama persis seperti yang dihasilkan Prisma CLI: `prisma/migrations/<yyyyMMddHHmmss>_<nama_singkat>/migration.sql`. Format SQL-nya ikuti gaya migrasi yang sudah ada di folder itu (`CREATE TABLE`/`ALTER TABLE` standar Postgres, nama constraint mengikuti konvensi Prisma: `"<Model>_pkey"`, `"<Model>_<field>_key"`, dst).
2. **Jalankan `npx prisma generate`** dulu (ini SELALU bisa, tidak butuh koneksi DB) supaya Prisma Client ter-update sesuai schema baru — berguna buat lanjut coding sambil migrasi beneran belum ter-apply.
3. **Apply SQL-nya lewat script Node sekali-pakai**, yang memakai `@prisma/adapter-neon` (driver HTTP yang sama dipakai app) — BUKAN Prisma CLI:
   - Buat `PrismaClient` dengan `PrismaNeon` adapter (sama seperti `src/lib/prisma.ts`).
   - Baca isi `migration.sql`, pecah jadi per-statement, jalankan tiap statement lewat `prisma.$executeRawUnsafe(stmt)`.
   - Setelah semua statement sukses, **insert manual ke tabel `_prisma_migrations`** (kolom: `id`, `checksum` [sha256 hex dari isi file], `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`) — supaya migrasi ini tercatat PERSIS seperti kalau dijalankan CLI asli, dan `prisma migrate status`/`deploy` di masa depan tidak bingung/coba re-apply.
   - Jalankan script ini dengan `node --env-file=.env <script>.mjs` dari root project (supaya `DATABASE_URL` ke-load dan `@prisma/client`/`@prisma/adapter-neon` ke-resolve dari `node_modules` lokal — script HARUS ditaruh di dalam folder project, bukan di `/tmp`, kalau tidak module resolution-nya gagal).
   - Hapus script sekali-pakai itu sesudah selesai — jangan commit ke repo.

## ⚠️ Jebakan yang pernah jadi bug nyata

Saat strip komentar SQL (baris yang diawali `--`) sebelum `split(";")`: **jangan** buang seluruh "chunk" hasil split yang DIAWALI komentar — kalau sebuah statement multi-baris (mis. `CREATE TABLE`) didahului baris komentar tanpa ada `;` di antaranya, satu chunk hasil split itu berisi KOMENTAR + STATEMENT sekaligus, dan filter naif `!chunk.startsWith("--")` akan membuang statement DDL-nya juga, bukan cuma komentarnya. Fix yang benar: strip baris komentar dulu secara **per-baris** (`sql.split("\n").filter(line => !line.trim().startsWith("--")).join("\n")`), BARU `split(";")` di atas hasil yang sudah bersih itu.

## Checklist tiap bikin migrasi baru

1. Edit `prisma/schema.prisma`.
2. `npx prisma validate` lalu `npx prisma generate`.
3. Tulis `migration.sql` manual (lihat pola di atas).
4. Apply lewat script sekali-pakai (lihat pola di atas), atau minta user jalankan `prisma migrate dev` dari mesin mereka sendiri kalau tersedia.
5. Verifikasi dengan query langsung ke model yang baru (lewat Prisma Client biasa, bukan raw SQL) untuk memastikan kolom/tabelnya benar-benar cocok dengan schema.
6. `npx tsc --noEmit`, `npm run lint`, `npm run build`.
