export function useIsAuthenticated(): boolean {
    return localStorage.getItem("auth-token") != null;
}