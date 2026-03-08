import { useCallback } from "react";
import { useAuth0 } from "@auth0/auth0-react";

/**
 * Hook that returns an authenticated fetch function.
 * Automatically adds Authorization: Bearer <token> for protected API calls.
 *
 * Usage:
 *   const { authFetch } = useAuthFetch();
 *   const res = await authFetch("/api/explain", { method: "POST", body: formData });
 *   const res = await authFetch("/api/me");
 */
export function useAuthFetch() {
  const { getAccessTokenSilently } = useAuth0();

  const authFetch = useCallback(
    async (url, options = {}) => {
      const audience = import.meta.env.VITE_AUTH0_AUDIENCE;
      const token = await getAccessTokenSilently({
        authorizationParams: audience ? { audience } : {},
      });
      const headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      };
      return fetch(url, { ...options, headers });
    },
    [getAccessTokenSilently]
  );

  return { authFetch };
}
