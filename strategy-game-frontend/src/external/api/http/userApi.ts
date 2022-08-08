import {AuthData} from "../../../models/authData";
import {UserStateAccess} from "../../state/user/userStateAccess";
import {HttpClient} from "./httpClient";

export class UserApi {

    private readonly httpClient: HttpClient;
    private readonly userStateAccess: UserStateAccess;

    constructor(httpClient: HttpClient, userStateAccess: UserStateAccess) {
        this.httpClient = httpClient;
        this.userStateAccess = userStateAccess;
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
                token: this.userStateAccess.getToken()
            })
            .then(() => undefined);
    }

}
