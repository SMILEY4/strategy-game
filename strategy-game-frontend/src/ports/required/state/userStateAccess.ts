export interface UserStateAccess {
    setAuth: (token: string) => void;
    clearAuth: () => void
}