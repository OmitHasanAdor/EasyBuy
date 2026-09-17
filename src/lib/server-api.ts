import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { API_URL } from "@/config/api";

/**
 * Calls easybuy-server from a Server Component on behalf of the signed-in
 * user. The Better-Auth session token is forwarded as a Bearer header and
 * the API works out who the user is from it — never put user ids in the URL.
 *
 * Returns null when nobody is signed in.
 */
export async function serverApiFetch(
  path: string,
  init: RequestInit = {}
): Promise<Response | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  const token = session?.session?.token;
  if (!token) return null;

  const requestHeaders = new Headers(init.headers);
  requestHeaders.set("Authorization", `Bearer ${token}`);

  return fetch(`${API_URL}${path}`, {
    cache: "no-store",
    ...init,
    headers: requestHeaders,
  });
}
