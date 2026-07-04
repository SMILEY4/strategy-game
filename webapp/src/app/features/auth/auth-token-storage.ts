/** Persistence layer for auth tokens, backed by localStorage. */
export interface AuthTokenStorage {
    getToken: () => string | null;
    setToken: (token: string) => void;
    clear: () => void;
}

const LocalStorageKeys = {
    TOKEN: "token",
};

export const authTokenStorage = (): AuthTokenStorage => {
    return {
        getToken: () => {
            return localStorage.getItem(LocalStorageKeys.TOKEN) ?? null;
        },
        setToken: (token: string) => {
            return localStorage.setItem(LocalStorageKeys.TOKEN, token);
        },
        clear: () => {
            localStorage.removeItem(LocalStorageKeys.TOKEN);
        },
    };

};