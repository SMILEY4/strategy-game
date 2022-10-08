import {UserStore} from "./userStore";

export class UserStateAccess {

    setAuth(token: string): void {
        UserStore.useState.getState().setAuth(token);
    }

    clearAuth(): void {
        UserStore.useState.getState().clearAuth();
    }

    getToken(): string | null {
        const token = UserStore.useState.getState().idToken;
        return token ? token : null;
    }

    getUserId(): string | null {
        const token = this.getToken();
        if (token) {
            return UserStore.userIdFromToken(token);
        } else {
            return null;
        }
    }

}