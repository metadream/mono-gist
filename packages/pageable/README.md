# @gist/pageable

Pagination helper with compact page number display (e.g. `[1, ..., 8, 9, 10, 11, 12, ..., 20]`). Zero dependencies.

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
