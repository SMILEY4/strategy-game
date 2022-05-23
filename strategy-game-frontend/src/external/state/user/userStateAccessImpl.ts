import {UserStateAccess} from "../../../ports/required/state/userStateAccess";
import {UserStore} from "./UserStore";

export class UserStateAccessImpl implements UserStateAccess {

    setAuth(token: string): void {
        UserStore.useState.getState().setAuth(token);
    }

    clearAuth(): void {
        UserStore.useState.getState().clearAuth();
    }

}