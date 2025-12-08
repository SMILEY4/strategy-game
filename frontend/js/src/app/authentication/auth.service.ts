import {UserClient} from "../user/user.client";
import {jwtDecode, JwtPayload} from "jwt-decode";

/**
 * Service implementing user authentication functionality.
 * Usage of this service directly is discouraged. Use "useAuth" hook instead.
 */
export class AuthService {

    private readonly KEY_USER_ID = "user_id";
    private readonly KEY_AUTH_TOKEN = "auth_token";
    private readonly KEY_AUTH_EXPIRATION = "auth_expiration";

    /**
     * Log in using the given credentials.
     */
    login(username: string, password: string): Promise<void> {
        return Promise.resolve()
            .then(() => {
                this.clearAuthData();
            })
            .then(() => {
                return UserClient.logIn(username, password);
            })
            .then(({idToken}) => {
                this.setAuthData(idToken);
            })
            .catch(err => {
                console.error("Error during login", err);
                this.clearAuthData();
                throw err;
            });
    }

    /**
     * Clear any (most) locally stored authentication data.
     */
    clearStoredAuthData(): void {
        this.clearAuthData();
    }

    /**
     * Get the user id (if authenticated) or null.
     */
    getUserId(): string | null {
        return localStorage.getItem(this.KEY_USER_ID);
    }

    /**
     * Get the auth token (if authenticated) or null.
     */
    getAuthToken(): string | null {
        return localStorage.getItem(this.KEY_AUTH_TOKEN);
    }

    /**
     * Get the auth token expiration data (if authenticated) or null.
     */
    getExpirationDate(): number | null {
        try {
            const timestamp = Number.parseInt(localStorage.getItem(this.KEY_AUTH_EXPIRATION) ?? "-1");
            return timestamp < 0 ? null : timestamp;
        } catch {
            return null;
        }
    }

    /**
     * Check whether a user is currently authenticated.
     */
    isAuthenticated(): boolean {
        if (this.getAuthToken() == null) return false;
        if ((this.getExpirationDate() ?? 0) < Date.now()) return false;
        return true;
    }

    private setAuthData(authToken: string): void {
        const jwtDecoded: JwtPayload = jwtDecode(authToken);

        // get the expiration utc timestamp in milliseconds
        let expiration = (jwtDecoded.exp ?? -1);
        expiration = (expiration < 1e10) ? expiration * 1000 : expiration;

        // get the user id
        const userId = jwtDecoded.sub ?? "";

        localStorage.setItem(this.KEY_USER_ID, userId);
        localStorage.setItem(this.KEY_AUTH_TOKEN, authToken);
        localStorage.setItem(this.KEY_AUTH_EXPIRATION, expiration.toString());
    }

    private clearAuthData(): void {
        localStorage.removeItem(this.KEY_USER_ID);
        localStorage.removeItem(this.KEY_AUTH_TOKEN);
        localStorage.removeItem(this.KEY_AUTH_EXPIRATION);
    }

}

export const authService = new AuthService();