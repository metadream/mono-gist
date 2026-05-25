# @gist/github

GitHub OAuth helper for web frameworks. Zero external dependencies.

## Install

```bash
bunx jsr add @gist/github
```

## Usage

```ts
import { createGitHubAuth } from "@gist/github";

const gh = createGitHubAuth({
    clientId: "your-client-id",
    clientSecret: "your-client-secret",
    redirectUri: "http://localhost:3000/auth",
});

// Redirect user to gh.loginUrl
// Handle callback with gh.authHandler
```
