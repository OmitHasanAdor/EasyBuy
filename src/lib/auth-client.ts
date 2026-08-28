import { createAuthClient } from "better-auth/react";
import { adminClient, jwtClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
    plugins: [
        // jwtClient exposes authClient.token() — used to get the JWT
        // before making calls to the Express backend
        jwtClient(),

        // adminClient enables admin actions from client-side (admin users only)
        adminClient(),
    ],
});

// Export individual methods for easy import
export const {
    signIn,
    signOut,
    signUp,
    useSession,
    getSession,
} = authClient;