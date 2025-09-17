import {HttpClient} from "../../common/httpClient";
import {UserStateAccess} from "../../state/userStateAccess";
import {LoginData} from "./loginData";
import {UserClient} from "../../logic/user/service/userClient";

/**
 * API-Client for user operations
 */
export class UserClientImpl implements UserClient {

    private readonly userStateAccess: UserStateAccess;
    private readonly httpClient: HttpClient;

    constructor(httpClient: HttpClient, userStateAccess: UserStateAccess) {
        this.httpClient = httpClient;
        this.userStateAccess = userStateAccess;
    }

    public login(email: string, password: string): Promise<LoginData> {
        return this.httpClient.post<LoginData>({
            url: "/api/user/login",
            body: {
                email: email,
                password: password,
            },
        });
    }

    public signUp(email: string, password: string, username: string): Promise<void> {
        return this.httpClient.post<void>({
            url: "/api/user/signup",
            body: {
                email: email,
                password: password,
                username: username,
            },
        });
    }

    public deleteUser(email: string, password: string): Promise<void> {
        return this.httpClient.delete<void>({
            url: "/api/user/delete",
            body: {
                email: email,
                password: password,
            },
            requireAuth: true,
            token: this.userStateAccess.getAuthTokenOrNull(),
        });
    }

}