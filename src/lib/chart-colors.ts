const CATEGORICAL_SLOTS = 8;

function hashSlot(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % CATEGORICAL_SLOTS;
}

/**
 * Deterministic name -> `var(--chart-cat-N)` mapping for categorical charts
 * (pie/breakdown by category, by platform, etc). Pure function of the string
 * itself — not the item's position in whatever array happens to be loaded —
 * so the same name always gets the same color regardless of month/year or
 * which other names are present alongside it.
 */
export function hashCategoryColor(name: string): string {
  return `var(--chart-cat-${hashSlot(name) + 1})`;
}

/**
 * Same hash-based slot as `hashCategoryColor`, but resolves collisions
 * within a single render's category list via linear probing — so two
 * categories that happen to hash to the same slot never end up sharing a
 * color in the same chart. Once more than 8 unique names are passed in, the
 * 9th+ falls back to sharing a slot (the palette only has 8 validated hues).
 */
export function assignDistinctColors(names: string[]): Map<string, string> {
  const taken = new Set<number>();
  const result = new Map<string, string>();
  for (const name of names) {
    if (result.has(name)) continue;
    let slot = hashSlot(name);
    let attempts = 0;
    while (taken.has(slot) && attempts < CATEGORICAL_SLOTS) {
      slot = (slot + 1) % CATEGORICAL_SLOTS;
      attempts++;
    }
    taken.add(slot);
    result.set(name, `var(--chart-cat-${slot + 1})`);
  }
  return result;
}
