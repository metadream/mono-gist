/** Generic expiring in-memory cache with automatic periodic cleanup. */
export class ExpiringCache<K, V> {
    private cache: Map<K, { value: V; expires: number }>;
    private readonly cleanupInterval: ReturnType<typeof setInterval>;

    /**
     * @param cleanupIntervalSeconds How often (in seconds) to run cleanup of expired entries. Defaults to 60.
     */
    constructor(cleanupIntervalSeconds = 60) {
        this.cache = new Map();
        this.cleanupInterval = setInterval(() => this.cleanup(), cleanupIntervalSeconds * 1000);
    }

    /** Get a value by key. Returns `undefined` if the key doesn't exist or has expired. */
    get(key: K): V | undefined {
        const entry = this.cache.get(key);
        if (!entry) return;
        if (entry.expires > Date.now()) return entry.value;
        this.cache.delete(key);
    }

    /** Set a value with a TTL (time-to-live) in seconds. */
    set(key: K, value: V, ttl: number): void {
        const expires = Date.now() + ttl * 1000;
        this.cache.set(key, { value, expires });
    }

    /** Update the TTL of an existing key. Returns `false` if the key doesn't exist. */
    ttl(key: K, ttl: number): boolean {
        const entry = this.cache.get(key);
        if (!entry) return false;
        entry.expires = Date.now() + ttl * 1000;
        return true;
    }

    /** Remove a key from the cache. Returns `true` if the key existed. */
    delete(key: K): boolean {
        return this.cache.delete(key);
    }

    /** Remove all entries from the cache. */
    clear(): void {
        this.cache.clear();
    }

    /** Stop the internal cleanup timer. Call when the cache is no longer needed. */
    dispose(): void {
        clearInterval(this.cleanupInterval);
    }

    private cleanup(): void {
        const now = Date.now();
        for (const [key, entry] of this.cache.entries()) {
            if (entry.expires < now) {
                this.cache.delete(key);
            }
        }
    }
}
