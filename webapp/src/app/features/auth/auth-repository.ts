import type {AuthClient} from "@app/features/auth/auth.client.ts";
import type {AuthTokenStorage} from "@app/features/auth/auth-token-storage.ts";

/** Repository for authentication operations, coordinating client calls with token storage. */
export interface AuthRepository {
    isAuthenticated: () => boolean;
    getToken: () => string | null;
    logIn: (username: string, password: string) => Promise<void>;
    logOut: () => Promise<void>;
    clearLocal: () => void;
}

interface Dependencies {
    authStorage: AuthTokenStorage;
    authClient: AuthClient;
}

export const authRepository = ({authStorage, authClient}: Dependencies): AuthRepository => {

    return {
        isAuthenticated: () => {
            return !!authStorage.getToken();
        },

        getToken: () => {
            return authStorage.getToken();
        },

        logIn: async (username: string, password: string) => {
            try {
                const authData = await authClient.logIn(username, password);
                authStorage.setToken(authData.token);
            } catch (error) {
                authStorage.clear();
                throw error;
            }
        },

        logOut: async () => {
            authStorage.clear();
            await authClient.logOut();
        },

        clearLocal: () => {
            authStorage.clear();
        },
    };

};