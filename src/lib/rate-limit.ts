type RateLimitEntry = {
  timestamps: number[]
}

type RateLimitOptions = {
  windowMs: number
  max: number
}

const MAX_KEYS = 10_000

export function createRateLimiter({ windowMs, max }: RateLimitOptions) {
  const store = new Map<string, RateLimitEntry>()

  function evictIfNeeded() {
    if (store.size >= MAX_KEYS) {
      const oldest = store.keys().next().value
      if (oldest) store.delete(oldest)
    }
  }

  function check(key: string): { ok: boolean; remaining: number } {
    const now = Date.now()
    const entry = store.get(key)

    if (!entry) {
      evictIfNeeded()
      store.set(key, { timestamps: [now] })
      return { ok: true, remaining: max - 1 }
    }

    entry.timestamps = entry.timestamps.filter(
      (ts) => now - ts < windowMs,
    )

    if (entry.timestamps.length >= max) {
      return { ok: false, remaining: 0 }
    }

    entry.timestamps.push(now)
    return { ok: true, remaining: max - entry.timestamps.length }
  }

  return { check }
}
