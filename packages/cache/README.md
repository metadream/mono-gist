# @gist/cache

Generic expiring in-memory cache with automatic cleanup. Zero dependencies.

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
