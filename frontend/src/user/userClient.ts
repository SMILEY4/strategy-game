import {AuthProvider} from "./authProvider";
import {HttpClient} from "../shared/httpClient";

/**
 * API-Client for user operations
 */
export class UserClient {

    private readonly authProvider: AuthProvider;
    private readonly httpClient: HttpClient;

    constructor(authProvider: AuthProvider, httpClient: HttpClient) {
        this.authProvider = authProvider;
        this.httpClient = httpClient;
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
            token: this.authProvider.getToken(),
        });
    }

}

export interface LoginData {
    idToken: string,
    refreshToken?: string
}