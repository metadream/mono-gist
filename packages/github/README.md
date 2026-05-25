# @gist/github

GitHub OAuth helper for web frameworks. Zero external dependencies.

**Supported runtimes:** ✅ Node.js · ✅ Deno · ✅ Bun · ✅ Cloudflare Workers · ✅ Browsers

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

## API

### `createGitHubAuth(config: GitHubAuthConfig): { loginUrl, authHandler }`

**Config:**
- `clientId` (`string`) — GitHub OAuth App client ID
- `clientSecret` (`string`) — GitHub OAuth App client secret
- `redirectUri` (`string`) — Callback URL
- `scope` (`string`, default `"read:user"`) — OAuth scope
- `authUrl` (`string`, default `"https://github.com/login/oauth/authorize"`)
- `tokenUrl` (`string`, default `"https://github.com/login/oauth/access_token"`)
- `apiUrl` (`string`, default `"https://api.github.com/user"`)
- `tlsRejectUnauthorized` (`boolean`, default `true`) — Disable TLS verification (set to `false` for self-signed certs in dev)

**Returns:**
- `loginUrl` — The GitHub OAuth authorization URL to redirect users to
- `authHandler(onAuth)` — Returns a middleware handler that exchanges the `?code` for a token, fetches the user, and calls `onAuth(context, user)`
