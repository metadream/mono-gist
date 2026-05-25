# @gist/mustache

Tiny independent template engine with Mustache-like syntax. Supports partials, blocks, conditionals, and iterations. Works in Bun, Deno, and Node.js.

## Install

```bash
bunx jsr add @gist/mustache
```

## Usage

```ts
import { Stache } from "@gist/mustache";

const engine = new Stache("./templates");

// Render a string
const html = await engine.render("Hello {{=name}}!", { name: "World" });

// Render a file
const result = await engine.view("page.html", { items: [1, 2, 3] });
```

## API

### `new Stache(tmplRoot: string, globalVars?: Record<string, unknown>)`
Creates a template engine. `tmplRoot` is the directory for partials and views; `globalVars` are injected into every template.

### `stache.compile(tmpl: string): Renderer`
Compiles a template string into a `(data: unknown) => Promise<string>` function.

### `stache.render(tmpl: string, data: unknown): Promise<string>`
Compiles and renders a template string in one call.

### `stache.view(file: string, data: unknown): Promise<string>`
Loads a template file (relative to `tmplRoot`), caches the compiled result, and renders with `data`.

**Template syntax:**
- `{{=expr}}` — Escaped interpolation
- `{{? condition}}…{{?}}` — Conditional
- `{{?? condition}}…{{?}}` — Conditional with else
- `{{~ array : value}}…{{~}}` — Iteration (also `{{~ array : value : index}}`)
- `{{code}}` — Inline JavaScript evaluation
- `{{@ partialName}}` — Include partial
- `{{< blockName}}content{{<}}` — Define a block
- `{{> blockName}}` — Insert a block
