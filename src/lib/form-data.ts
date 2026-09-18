/**
 * Reads `keys` off `formData` in one pass, mapping each to `undefined` when
 * absent/empty instead of Web API's `null`. Safe for both required and
 * optional zod fields: a required field still fails validation the same way
 * whether it receives `null` or `undefined`, so this doesn't change any
 * existing validation error behavior — it just removes the need to write
 * `formData.get("x") || undefined` once per field, per action.
 */
export function pickFormFields<K extends string>(
  formData: FormData,
  keys: readonly K[],
): Record<K, FormDataEntryValue | undefined> {
  return Object.fromEntries(keys.map((key) => [key, formData.get(key) || undefined])) as Record<
    K,
    FormDataEntryValue | undefined
  >;
}
