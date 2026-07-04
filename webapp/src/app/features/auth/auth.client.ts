import type {AuthData} from "@app/features/auth/auth-data.ts";
import type {HttpClient} from "@modules/client/http-client.ts";

/** Auth API client for login/logout endpoints. */
export interface AuthClient {
    logIn: (username: string, password: string) => Promise<AuthData>;
    logOut: () => Promise<void>;
}

interface Dependencies {
    httpClient: HttpClient;
}

export const authClient = ({httpClient}: Dependencies): AuthClient => ({

    logIn: (username: string, password: string) => {
        return httpClient.post<AuthData>({
            url: "/api/identity/login",
            content: {
                username: username,
                password: password,
            },
        });
    },

    logOut: () => {
        return httpClient.post({
            url: "/api/identity/logout",
            authenticated: true,
        });
    },

});