import jwt_decode from "jwt-decode";
import {AuthProvider} from "../../../ports/required/state/authProvider";
import {UserStore} from "./userStore";

export class AuthProviderImpl implements AuthProvider {

    isAuthenticated(): boolean {
        return UserStore.useState.getState().idToken !== null;
    }

    getToken(): string {
        const token = UserStore.useState.getState().idToken;
        return token ? token : "";
    }

    getUserId(): string {
        return AuthProviderImpl.extractUserId(this.getToken());
    }

    private static extractUserId(token: string): string {
        if (token) {
            return (jwt_decode(token) as any).sub;
        } else {
            return "";
        }
    }

}