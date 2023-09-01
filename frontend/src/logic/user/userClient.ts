import {AuthProvider} from "../authProvider";
import {HttpClient} from "../../shared/httpClient";

export interface LoginData {
    idToken: string,
    refreshToken?: string
}

export class UserClient {

    private readonly authProvider: AuthProvider;
    private readonly httpClient: HttpClient;


    constructor(authProvider: AuthProvider, httpClient: HttpClient) {
        this.authProvider = authProvider;
        this.httpClient = httpClient;
    }


    login(email: string, password: string): Promise<LoginData> {
        return this.httpClient.post<LoginData>({
            url: "/api/user/login",
            body: {
                email: email,
                password: password,
            },
        });
    }

    signUp(email: string, password: string, username: string): Promise<void> {
        return this.httpClient.post<void>({
            url: "/api/user/signup",
            body: {
                email: email,
                password: password,
                username: username,
            },
        });
    }

    deleteUser(email: string, password: string): Promise<void> {
        return this.httpClient.delete<void>({
            url: "/api/user/delete",
            body: {
                email: email,
                password: password,
            },
            requireAuth: true,
            token: this.authProvider.getToken(),
        });
    }

}