# mono-gist

Monorepo of lightweight single-file libraries, organized as [JSR workspace](https://jsr.io) packages. Each package is independently publishable to `jsr.io/@gist/*`.

## Packages

| Package | Description |
|---------|-------------|
| [`@gist/cache`](./packages/cache) | Expiring in-memory cache with automatic cleanup |
| [`@gist/crypto`](./packages/crypto) | Cryptographic utilities: SHA-1, AES-CBC, RSA-OAEP, JWT encryption |
| [`@gist/github`](./packages/github) | GitHub OAuth helper for web frameworks |
| [`@gist/mustache`](./packages/mustache) | Tiny Mustache-like template engine (works in Bun, Deno, Node) |
| [`@gist/pageable`](./packages/pageable) | Pagination helper with compact page number display |
| [`@gist/utils`](./packages/utils) | General-purpose utilities: string/date formatting, localeCompare, merge |

## Structure

```
mono-gist/
├── packages/
│   ├── cache/         # @gist/cache
│   ├── crypto/        # @gist/crypto
│   ├── github/        # @gist/github
│   ├── mustache/      # @gist/mustache
│   ├── pageable/      # @gist/pageable
│   └── utils/         # @gist/utils
└── README.md
```

## Publish

```
git add -A
git commit -m "fix: publish per package to avoid root validation"
git push
git tag -d 0.2.0
git push origin :refs/tags/0.2.0
git tag 0.2.0
git push origin 0.2.0
```