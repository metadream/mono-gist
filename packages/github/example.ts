import { createGitHubAuth } from "./mod.ts";

const gh = createGitHubAuth({
    clientId: "YOUR_CLIENT_ID",
    clientSecret: "YOUR_CLIENT_SECRET",
    redirectUri: "http://localhost:3000/auth",
});

console.log("login url:", gh.loginUrl);

// In a web framework:
// gh.authHandler(async (c, user) => {
//     console.log("authenticated user:", user);
//     return user;
// });
