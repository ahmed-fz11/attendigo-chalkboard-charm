import { getAccessToken } from "./supabase";

type FetchArgs = Parameters<typeof fetch>;

type FetchInput = FetchArgs[0];
type FetchInit = FetchArgs[1];

/**
 * Wraps fetch by automatically attaching the Supabase session token to the Authorization header.
 * Use for calling downstream services (e.g. n8n) that expect a bearer token.
 */
export const authorizedFetch = async (
  input: FetchInput,
  init: FetchInit = {}
) => {
  const token = await getAccessToken();
  const headers = new Headers(init?.headers ?? {});

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(input, {
    ...init,
    headers,
  });
};
