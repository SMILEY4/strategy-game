import {AuthData} from "../../models/authData";
import {AuthProvider} from "../state/user/authProvider";
import {HttpClient} from "./httpClient";

export class UserApi {

    private readonly httpClient: HttpClient;
    private readonly authProvider: AuthProvider;

    constructor(httpClient: HttpClient, authProvider: AuthProvider) {
        this.httpClient = httpClient;
        this.authProvider = authProvider;
    }


    signUp(email: string, password: string, username: string): Promise<void> {
        return this.httpClient
            .post({
                url: "/api/user/signup",
                body: {
                    email: email,
                    password: password,
                    username: username
                },
            })
            .then(() => undefined);
    }


    login(email: string, password: string): Promise<AuthData> {
        return this.httpClient
            .post({
                url: "/api/user/login",
                body: {
                    email: email,
                    password: password,
                },
            })
            .then(response => response.json())
            .then(data => ({
                idToken: data.idToken,
                refreshToken: data.refreshToken
            }));
    }


    deleteUser(email: string, password: string): Promise<void> {
        return this.httpClient
            .post({
                url: "/api/user/delete",
                body: {
                    email: email,
                    password: password,
                },
                requireAuth: true,
                token: this.authProvider.getToken()
            })
            .then(() => undefined);
    }

}
