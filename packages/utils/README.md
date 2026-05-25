# @gist/utils

General-purpose utility functions: string formatting, date formatting, path normalization, array/object operations, and more. Zero dependencies (uses `path` from std lib).

## Install

```bash
bunx jsr add @gist/utils
```

## Usage

```ts
import { nanoid, formatDate, formatBytes, localeCompare, mergeObjects } from "@gist/utils";

nanoid();                    // => "a3B...x9K"
formatDate(new Date(), "yyyy-MM-dd"); // => "2026-05-25"
formatBytes(1048576);        // => "1 MB"
localeCompare("张三", "李四"); // => -1
mergeObjects({ a: 1 }, { b: 2 }); // => { a: 1, b: 2 }
```
