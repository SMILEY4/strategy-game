import {HttpClient} from "../../../common/httpClient";
import {UserStateAccess} from "../../../state/userStateAccess";

/**
 * API-Client for user operations
 */
export class UserClient {

    private readonly userStateAccess: UserStateAccess;
    private readonly httpClient: HttpClient;

    constructor(httpClient: HttpClient, userStateAccess: UserStateAccess) {
        this.httpClient = httpClient;
        this.userStateAccess = userStateAccess;
    }

    /**
     * Login with the given credentials
     */
    public login(email: string, password: string): Promise<LoginData> {
        return this.httpClient.post<LoginData>({
            url: "/api/user/login",
            body: {
                email: email,
                password: password,
            },
        });
    }

    /**
     * Sign Up as a new user with the given credentials
     */
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

    /**
     * Delete the user with the given credentials
     */
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

export interface LoginData {
    idToken: string,
    refreshToken?: string
}