export interface UserRepository {
    isAuth: () => boolean;
    clearAuth: () => void;
    setAuthToken: (token: string) => void;
    getAuthToken: () => string;
    getUserId: () => string;
}