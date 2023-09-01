import {UserApi} from "../../core/required/userApi";
import {HttpClient} from "../../shared/httpClient";
import {AuthProvider} from "./clients/authProvider";
import {AuthData} from "./models/authData";

export class UserApiImpl implements UserApi {

    private readonly authProvider: AuthProvider;
    private readonly httpClient: HttpClient;


    constructor(authProvider: AuthProvider, httpClient: HttpClient) {
        this.authProvider = authProvider;
        this.httpClient = httpClient;
    }


    login(email: string, password: string): Promise<AuthData> {
        return this.httpClient.post<AuthData>({
            url: "/api/user/login",
            body: {
                email: email,
                password: password,
            }
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