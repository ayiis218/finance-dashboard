const CATEGORICAL_SLOTS = 8;

/**
 * Deterministic name -> `var(--chart-cat-N)` mapping for categorical charts
 * (pie/breakdown by category, by platform, etc). Pure function of the string
 * itself — not the item's position in whatever array happens to be loaded —
 * so the same name always gets the same color regardless of month/year or
 * which other names are present alongside it.
 */
export function hashCategoryColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0;
  }
  const slot = (Math.abs(hash) % CATEGORICAL_SLOTS) + 1;
  return `var(--chart-cat-${slot})`;
}
