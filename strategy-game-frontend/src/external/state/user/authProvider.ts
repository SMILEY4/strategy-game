import jwt_decode from "jwt-decode";
import {UserStore} from "./userStore";

export class AuthProvider {

    isAuthenticated(): boolean {
        return UserStore.useState.getState().idToken !== null;
    }

    getToken(): string {
        const token = UserStore.useState.getState().idToken;
        return token ? token : "";
    }

    getUserId(): string {
        return AuthProvider.extractUserId(this.getToken());
    }

    private static extractUserId(token: string): string {
        if (token) {
            return (jwt_decode(token) as any).sub;
        } else {
            return "";
        }
    }

}