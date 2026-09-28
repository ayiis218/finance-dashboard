import type { VercelConfig } from "@vercel/config/v1";

export const config: VercelConfig = {
  crons: [
    { path: "/api/cron/snapshot-net-worth", schedule: "0 0 1 * *" },
    { path: "/api/cron/run-recurring-transactions", schedule: "0 1 * * *" },
    { path: "/api/cron/send-weekly-reminder", schedule: "0 12 * * 0" },
  ],
};
