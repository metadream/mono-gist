export interface GitHubUser {
    id: number;
    login: string;
    node_id: string;
    avatar_url: string;
    html_url: string;
    name: string | null;
    email: string | null;
    bio: string | null;
    [key: string]: unknown;
}

export interface GitHubAuthConfig {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    scope?: string;
    authUrl?: string;
    tokenUrl?: string;
    apiUrl?: string;
    /** Disable TLS certificate verification (default: true). Set to false for self-signed certs in dev. */
    tlsRejectUnauthorized?: boolean;
}

export function createGitHubAuth(
    config: GitHubAuthConfig,
): { loginUrl: string; authHandler: (onAuth: (c: any, user: GitHubUser) => any) => (c: any) => Promise<any> } {
    const scope = config.scope ?? "read:user";
    const authUrl = config.authUrl ?? "https://github.com/login/oauth/authorize";
    const tokenUrl = config.tokenUrl ?? "https://github.com/login/oauth/access_token";
    const apiUrl = config.apiUrl ?? "https://api.github.com/user";
    const tls = config.tlsRejectUnauthorized !== false ? undefined : { rejectUnauthorized: false };
    const loginUrl = `${authUrl}?client_id=${config.clientId}&redirect_uri=${config.redirectUri}&scope=${scope}`;

    function authHandler(onAuth: (c: any, user: GitHubUser) => any) {
        return async (c: any) => {
            const { code, error } = c.query;
            if (error) throw new Error(`${error}: ${c.query.error_description || "Authorization denied"}`);
            if (!code) throw new Error("Missing code");

            const tokRes = await fetch(tokenUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json", Accept: "application/json" },
                body: JSON.stringify({
                    code,
                    client_id: config.clientId,
                    client_secret: config.clientSecret,
                    redirect_uri: config.redirectUri,
                }),
                ...(tls ? { tls } : {}),
            });
            const { access_token } = (await tokRes.json()) as Record<string, string>;
            if (!access_token) throw new Error("Failed to get access token");

            const userRes = await fetch(apiUrl, {
                headers: { Authorization: `Bearer ${access_token}` },
                ...(tls ? { tls } : {}),
            });
            const user = (await userRes.json()) as GitHubUser;
            return onAuth(c, user);
        };
    }

    return { loginUrl, authHandler };
}
