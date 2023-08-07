export interface UserRepository {
    isAuth: () => boolean;
    clearAuth: () => void;
    setAuthToken: (token: string) => void;
    getAuthToken: () => string;
    getAuthTokenOrNull: () => string | null;
    getUserId: () => string;
    getUserIdOrNull: () => string | null;
    getTokenExpiration: () => number
}