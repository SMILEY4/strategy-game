import type {HttpClientAuthHandler} from "@modules/client/http-client.ts";
import type {AuthTokenStorage} from "@app/features/auth/auth-token-storage.ts";
import {router} from "@/main.tsx";
import {Routes} from "@pages/routing.tsx";

interface Dependencies {
    storage: AuthTokenStorage;
}

/** Auth handler for the HTTP client, providing tokens and redirecting on 401. */
export const clientAuthHandler = ({storage}: Dependencies): HttpClientAuthHandler => {
    return {
        getToken: () => {
            const token = storage.getToken();
            if (!token) {
                void router.navigate("/" + Routes.LOGIN.path);
                throw new Error("No valid auth token found");
            }
            return token;
        },
        handleUnauthorized: () => {
            void router.navigate("/" + Routes.LOGIN.path);
            return undefined;
        },
    };
};