import { authClient } from "@/lib/auth-client";

async function getAuthToken(): Promise<string | null> {
  const { data: session } = await authClient.getSession();
  return session?.session?.token ?? null;
}

export async function authFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = await getAuthToken();
  if (!token) {
    throw new Error("Not signed in");
  }
  return fetch(path, {
    ...init,
    headers: {
      ...(init.headers ?? {}),
      Authorization: `Bearer ${token}`,
    },
  });
}