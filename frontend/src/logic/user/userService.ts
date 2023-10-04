import {UserClient} from "./userClient";
import {UserStateAccess} from "../../state/access/UserStateAccess";
import jwt_decode from "jwt-decode";

export class UserService {

    private readonly client: UserClient;

    constructor(client: UserClient) {
        this.client = client;
    }

    login(email: string, password: string): Promise<void> {
        return this.client.login(email, password)
            .then(data => UserStateAccess.setAuthToken(data.idToken));
    }

    signup(email: string, password: string, username: string): Promise<void> {
        return this.client.signUp(email, password, username);
    }

    isAuthenticated(): boolean {
        const token = UserStateAccess.getAuthTokenOrNull();
        if (token) {
            return this.getTokenExpiration(token) > Date.now();
        } else {
            return false;
        }
    }

    private getTokenExpiration(token: string): number {
        return this.expirationFromToken(token);
    }

    private expirationFromToken(token: string): number {
        return (jwt_decode(token) as any).exp * 1000;
    }

    private userIdFromToken(token: string | null): string {
        if (token) {
            return (jwt_decode(token) as any).sub;
        } else {
            return "";
        }
    }

}