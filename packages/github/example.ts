import { createGitHubAuth, type GitHubUser } from "./mod.ts";

const gh = createGitHubAuth({
    clientId: "YOUR_CLIENT_ID",
    clientSecret: "YOUR_CLIENT_SECRET",
    redirectUri: "http://localhost:3000/auth",
});

Bun.serve({
    port: 3000,
    async fetch(req) {
        const url = new URL(req.url);

        // Home page — show login link
        if (url.pathname === "/") {
            return new Response(
                `<html><body>
                    <h1>GitHub OAuth Demo</h1>
                    <a href="${gh.loginUrl}">Login with GitHub</a>
                </body></html>`,
                { headers: { "Content-Type": "text/html" } },
            );
        }

        // OAuth callback — exchange code for token, fetch user
        if (url.pathname === "/auth") {
            try {
                // Adapt Bun's URL to the context shape authHandler expects
                const ctx = { query: Object.fromEntries(url.searchParams) };
                const handler = gh.authHandler(async (_ctx: any, user: GitHubUser) => {
                    return new Response(
                        `<html><body>
                            <h1>Welcome, ${user.name ?? user.login}!</h1>
                            <p>Login: ${user.login}</p>
                            <p>ID: ${user.id}</p>
                            <img src="${user.avatar_url}" width="80" />
                            <p><a href="/">Back</a></p>
                        </body></html>`,
                        { headers: { "Content-Type": "text/html" } },
                    );
                });
                return await handler(ctx);
            } catch (err: any) {
                return new Response(`<html><body><h1>Auth Error</h1><p>${err.message}</p></body></html>`, {
                    status: 400,
                    headers: { "Content-Type": "text/html" },
                });
            }
        }

        return new Response("Not Found", { status: 404 });
    },
});

console.log(`Server running at http://localhost:3000`);
