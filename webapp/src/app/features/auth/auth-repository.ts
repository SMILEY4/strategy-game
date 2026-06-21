import type {AuthClient} from "@app/features/auth/auth.client.ts";

export interface AuthRepository {
    isAuthenticated: () => boolean;
    getToken: () => string | null;
    logIn: (username: string, password: string) => Promise<void>;
    logOut: () => Promise<void>;
    clearLocal: () => void
}

interface Dependencies {
    authClient: AuthClient;
}

const LocalStorageKeys = {
    TOKEN: "token",
};

export const authRepository = ({ authClient}: Dependencies): AuthRepository => {

    function storeAuthData(token: string): void {
        localStorage.setItem(LocalStorageKeys.TOKEN, token);
    }

    function clearAuthData(): void {
        localStorage.removeItem(LocalStorageKeys.TOKEN);
    }

    return {
        isAuthenticated: () => {
            const token = localStorage.getItem(LocalStorageKeys.TOKEN)
            return !!token
        },

        getToken: () => {
            return localStorage.getItem(LocalStorageKeys.TOKEN) ?? null
        },

        logIn: async (username: string, password: string) => {
            try {
                const authData = await authClient.logIn(username, password)
                storeAuthData(authData.token)
            } catch (error) {
                clearAuthData()
                throw error
            }
        },

        logOut: async () => {
            clearAuthData()
            await authClient.logOut()
        },

        clearLocal: () => {
            clearAuthData()
        },
    }

}