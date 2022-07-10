import {UserStore} from "./userStore";

export class UserStateAccess {

    setAuth(token: string): void {
        UserStore.useState.getState().setAuth(token);
    }

    clearAuth(): void {
        UserStore.useState.getState().clearAuth();
    }

}