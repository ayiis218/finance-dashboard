import type { NextConfig } from "next";

// Prisma runtime ships wasm query engines for every database; only PostgreSQL is used.
const unusedPrismaRuntime = [
  "./node_modules/@prisma/client/runtime/*.mysql.*",
  "./node_modules/@prisma/client/runtime/*.sqlite.*",
  "./node_modules/@prisma/client/runtime/*.sqlserver.*",
  "./node_modules/@prisma/client/runtime/*.cockroachdb.*",
  "./node_modules/@prisma/client/runtime/*.d.ts",
  "./node_modules/@prisma/client/runtime/*.map",
];

const nextConfig: NextConfig = {
  // `next/image` is not used, so sharp's native binaries never need to ship in the functions.
  images: { unoptimized: true },
  outputFileTracingExcludes: {
    "/*": [
      ...unusedPrismaRuntime,
      "./node_modules/@img/**/*",
      "./node_modules/sharp/**/*",
      "./node_modules/.prisma/client/*.node",
    ],
  },
};

export default nextConfig;
