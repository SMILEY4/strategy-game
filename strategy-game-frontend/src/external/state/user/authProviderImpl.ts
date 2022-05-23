import {AuthProvider} from "../../../ports/required/state/authProvider";
import {UserStore} from "./UserStore";

export class AuthProviderImpl implements AuthProvider {

    isAuthenticated(): boolean {
        return UserStore.useState.getState().idToken !== null;
    }

    getToken(): string {
        const token = UserStore.useState.getState().idToken;
        return token ? token : "";
    }

}