import type {HttpClient} from "@modules/client/http-client.ts";

export interface UserClient {
    register: (username: string, password: string) => Promise<void>;
}

interface Dependencies {
    httpClient: HttpClient;
}

export const userClient = ({httpClient}: Dependencies): UserClient => ({

    register: (username: string, password: string) => {
        return httpClient.post({
            url: "/api/identity/user",
            content: {
                username: username,
                password: password,
            },
        });
    },

});