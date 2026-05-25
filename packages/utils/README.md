# @gist/utils

General-purpose utility functions: string formatting, date formatting, path normalization, array/object operations, and more. Zero dependencies.

**Supported runtimes:** ✅ Node.js · ✅ Deno · ✅ Bun · ✅ Cloudflare Workers · ✅ Browsers

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

## API

### `nanoid(size?: number, alphabet?: string): string`
Generates a random string ID (default 24 chars, alphanumeric).

### `normalizePath(path: string): string`
Normalizes a path: forward slashes, removes leading `/`, deduplicates separators.

### `isValidPath(path: string): boolean`
Validates a file/folder path (length, illegal chars, reserved names, trailing space/dot).

### `randomInt(a: number, b: number): number`
Random integer in `[a, b)`. Swaps if `a > b`.

### `randomSample(origin: number, bound: number, size: number): number[]`
Random sample of unique integers in `[origin, bound)`.

### `firstUpperCase(text: string): string`
Capitalizes the first letter of each word.

### `stripHtml(html: string, ignoredTags?: string[]): string`
Strips HTML tags except those listed.

### `truncate(text: string, length: number): string`
Truncates text by visual width (CJK counts as 2 characters).

### `isPlainObject(value: unknown): boolean`
Checks if a value is a plain Object.

### `formatString(pattern: string, args: string[] | Record<string, string>): string`
Replaces `{0}`, `{1}` or `{key}` placeholders.

### `formatBytes(bytes: number): string`
Formats bytes to human-readable string (e.g. `"1.5 MB"`).

### `formatDate(date: Date | string | number, pattern: string): string`
Formats a date with tokens: `yyyy`, `yy`, `MM`, `M`, `dd`, `d`, `HH`, `H`, `hh`, `h`, `mm`, `m`, `ss`, `s`, `SSS`, `S`, `a`.

### `formatSeconds(seconds: number): string`
Formats seconds to human duration (e.g. `"1d 2h 30m 15s"`).

### `formatDuration(n: number, options?: { leading?: boolean; ms?: boolean }): string`
Formats milliseconds to `"HH:MM:SS.mmm"`.

### `parseDuration(s: string): number`
Parses `"HH:MM:SS.mmm"` back to milliseconds.

### `localeCompare(aStr: string, bStr: string, locale?: string): number`
Custom comparator: symbols > digits > letters > other. Respects locale for CJK.

### `mergeObjects(...objs: any[]): unknown`
Deep-merges multiple plain objects.

### `mergeArrays(arr1: any[], arr2: any[], callback: Function): unknown[]`
Merges two arrays by matching items via a callback.

### `swapArray(arr: unknown[], index1: number, index2: number): unknown[]`
Swaps two elements in an array in place.
