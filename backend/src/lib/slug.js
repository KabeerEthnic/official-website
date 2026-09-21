/** URL-safe slug from arbitrary text. */
export function slugify(value) {
  return String(value)
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

/**
 * Returns a slug that is not taken yet, appending -2, -3, ... when needed.
 * `exists` receives a candidate and resolves to true when it is already used.
 */
export async function uniqueSlug(base, exists) {
  const root = slugify(base) || 'item';
  let candidate = root;
  let suffix = 1;

  while (await exists(candidate)) {
    suffix += 1;
    candidate = `${root}-${suffix}`;
  }

  return candidate;
}
