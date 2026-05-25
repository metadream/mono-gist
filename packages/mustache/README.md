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
