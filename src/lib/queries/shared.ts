/** Prisma returns Decimal columns as objects; nullable ones collapse to 0. */
export function toNumber(value: unknown): number {
  return value === null || value === undefined ? 0 : Number(value);
}
