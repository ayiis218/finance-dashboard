// One-off script: apply a Prisma migration to Neon over its HTTP driver
// (port 443) instead of raw Postgres wire protocol (port 5432).
//
// Why: in this environment, TLS handshakes to Neon's proxy on 5432 reset
// consistently under TLS 1.3, and forcing TLS 1.2 (via node:tls or `pg`)
// still resets — the failure isn't about protocol version, something about
// Node's TLS stack specifically trips the proxy on that port. The Neon
// serverless HTTP driver sidesteps the whole problem by speaking to Neon's
// data API over regular HTTPS, which already works fine in this network.
// It only runs one statement per request, so we split the migration file
// on top-level `;` and execute each statement in order, then record the
// migration in `_prisma_migrations` so `prisma migrate status`/`deploy`
// recognize it later (e.g. once run from a network without this issue).
import { readFileSync } from "node:fs";
import { createHash, randomUUID } from "node:crypto";
import { neon } from "@neondatabase/serverless";

const migrationName = process.argv[2];
if (!migrationName) {
  console.error("Usage: node scripts/apply-init-migration.mjs <migration_folder_name>");
  process.exit(1);
}

const sqlPath = `prisma/migrations/${migrationName}/migration.sql`;
const fullSql = readFileSync(sqlPath, "utf8");
const checksum = createHash("sha256").update(fullSql).digest("hex");

function splitStatements(rawSql) {
  const sql = rawSql
    .split("\n")
    .filter((line) => !line.trim().startsWith("--"))
    .join("\n");

  const statements = [];
  let current = "";
  let dollarTag = null;

  for (let i = 0; i < sql.length; i++) {
    const rest = sql.slice(i);

    if (dollarTag) {
      if (rest.startsWith(dollarTag)) {
        current += dollarTag;
        i += dollarTag.length - 1;
        dollarTag = null;
        continue;
      }
    } else {
      const open = /^\$[A-Za-z_]*\$/.exec(rest);
      if (open) {
        dollarTag = open[0];
        current += dollarTag;
        i += dollarTag.length - 1;
        continue;
      }
      if (sql[i] === ";") {
        if (current.trim()) statements.push(current.trim());
        current = "";
        continue;
      }
    }
    current += sql[i];
  }
  if (current.trim()) statements.push(current.trim());
  return statements;
}

const statements = splitStatements(fullSql);

const sql = neon(process.env.DATABASE_URL);

await sql.query(`
  CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
    "id" VARCHAR(36) PRIMARY KEY,
    "checksum" VARCHAR(64) NOT NULL,
    "finished_at" TIMESTAMPTZ,
    "migration_name" VARCHAR(255) NOT NULL,
    "logs" TEXT,
    "rolled_back_at" TIMESTAMPTZ,
    "started_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "applied_steps_count" INTEGER NOT NULL DEFAULT 0
  );
`);

const existing = await sql.query(
  `SELECT 1 FROM "_prisma_migrations" WHERE migration_name = $1`,
  [migrationName],
);
if (existing.length > 0) {
  console.log(`Migration ${migrationName} already recorded, skipping.`);
  process.exit(0);
}

for (const statement of statements) {
  await sql.query(statement);
  console.log("OK:", statement.slice(0, 60).replace(/\s+/g, " "));
}

await sql.query(
  `INSERT INTO "_prisma_migrations"
    (id, checksum, finished_at, migration_name, applied_steps_count)
   VALUES ($1, $2, now(), $3, $4)`,
  [randomUUID(), checksum, migrationName, statements.length],
);

console.log(`\nApplied and recorded migration: ${migrationName}`);
