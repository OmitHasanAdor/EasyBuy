// Base URL of the easybuy-server API. Always import it from here instead of
// reading process.env directly, so every page uses the same value.
//
// NEXT_PUBLIC_ variables are inlined at build time. Production builds refuse
// to start without NEXT_PUBLIC_API_URL (see next.config.ts); in development
// we fall back to a locally running server.
const DEV_API_URL = "http://localhost:5000";

export const API_URL = (process.env.NEXT_PUBLIC_API_URL || DEV_API_URL).replace(/\/+$/, "");
