# @gist/cache

Generic expiring in-memory cache with automatic cleanup. Zero dependencies.

**Supported runtimes:** ✅ Node.js · ✅ Deno · ✅ Bun · ✅ Cloudflare Workers · ✅ Browsers

## Install

```bash
bunx jsr add @gist/cache
```

## Usage

```ts
import { ExpiringCache } from "@gist/cache";

const cache = new ExpiringCache<string, number>(30); // cleanup every 30s

cache.set("pi", 3.14, 60); // TTL: 60 seconds
cache.get("pi"); // => 3.14
cache.ttl("pi", 120); // extend TTL to 120s
cache.delete("pi");
cache.clear();
cache.dispose(); // stop cleanup timer
```

## API

### `new ExpiringCache<K, V>(cleanupIntervalSeconds?: number)`
Creates an expiring cache. `cleanupIntervalSeconds` defaults to `60`.

### `cache.get(key: K): V | undefined`
Returns the value for `key` if it exists and hasn't expired.

### `cache.set(key: K, value: V, ttl: number): void`
Stores `value` with a TTL in seconds.

### `cache.ttl(key: K, ttl: number): boolean`
Updates the TTL of an existing key. Returns `false` if the key doesn't exist.

### `cache.delete(key: K): boolean`
Removes `key` from the cache.

### `cache.clear(): void`
Empties the entire cache.

### `cache.dispose(): void`
Stops the internal cleanup timer.
