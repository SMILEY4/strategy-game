import jwt_decode from "jwt-decode";
import {UserStore} from "./userStore";

export class UserStateAccess {

    setAuth(token: string): void {
        UserStore.useState.getState().setAuth(token);
    }

    clearAuth(): void {
        UserStore.useState.getState().clearAuth();
    }

    getToken(): string {
        const token = UserStore.useState.getState().idToken;
        return token ? token : "";
    }

    getUserId(): string {
        return UserStateAccess.extractUserId(this.getToken());
    }

    private static extractUserId(token: string): string {
        if (token) {
            return (jwt_decode(token) as any).sub;
        } else {
            return "";
        }
    }

}