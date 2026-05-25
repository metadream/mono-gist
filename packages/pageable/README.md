# @gist/pageable

Pagination helper with compact page number display (e.g. `[1, ..., 8, 9, 10, 11, 12, ..., 20]`). Zero dependencies.

**Supported runtimes:** ✅ Node.js · ✅ Deno · ✅ Bun · ✅ Cloudflare Workers · ✅ Browsers

## Install

```bash
bunx jsr add @gist/pageable
```

## Usage

```ts
import { paginate } from "@gist/pageable";

const p = paginate(500, 20, 5);
// { totalSize: 500, totalPages: 25, pageNumber: 5, begin: 80, end: 100, limit: 20,
//   compactPages: [1, 0, 3, 4, 5, 6, 7, 0, 25] }
```

## API

### `paginate(totalSize: number, pageSize: number, pageNumber?: number): Paging`

Computes pagination metadata. `pageNumber` is 1-based and defaults to `1`.

**Returns:**
- `totalSize` — Total number of items
- `totalPages` — Total number of pages
- `pageNumber` — Current page (1-based)
- `begin` — Start index (0-based, inclusive)
- `end` — End index (0-based, exclusive)
- `limit` — Items on this page (`end - begin`)
- `compactPages` — Compact page array (`0` represents an ellipsis)
