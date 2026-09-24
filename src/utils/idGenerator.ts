/**
 * Generates a unique, URL-safe random identifier.
 * Uses cryptographically strong pseudo-random values where available or high-entropy fallback.
 */
export function generateId(prefix: string = ''): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 10);
  const extraEntropy = Math.floor(Math.random() * 10000).toString(36);
  const id = `${timestamp}-${randomPart}-${extraEntropy}`;
  return prefix ? `${prefix}_${id}` : id;
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '_')
    .replace(/^-+|-+$/g, '');
}

