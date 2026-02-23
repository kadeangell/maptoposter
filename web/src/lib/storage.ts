const KEY_PREFIX = "mtp:";

interface StoredEntry<T> {
  value: T;
  expiry: number | null;
}

/**
 * Read a value from localStorage, returning `fallback` when the key is
 * missing, expired, or cannot be parsed.
 */
export function getStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(KEY_PREFIX + key);
    if (raw === null) return fallback;

    const entry: StoredEntry<T> = JSON.parse(raw) as StoredEntry<T>;

    if (entry.expiry !== null && Date.now() > entry.expiry) {
      localStorage.removeItem(KEY_PREFIX + key);
      return fallback;
    }

    return entry.value;
  } catch {
    return fallback;
  }
}

/**
 * Write a value to localStorage with an optional TTL in milliseconds.
 * If `ttlMs` is omitted the entry never expires.
 */
export function setStored<T>(key: string, value: T, ttlMs?: number): void {
  const entry: StoredEntry<T> = {
    value,
    expiry: ttlMs !== undefined ? Date.now() + ttlMs : null,
  };
  localStorage.setItem(KEY_PREFIX + key, JSON.stringify(entry));
}

/**
 * Remove a value from localStorage.
 */
export function removeStored(key: string): void {
  localStorage.removeItem(KEY_PREFIX + key);
}
