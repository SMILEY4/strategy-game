import {UserStateAccess} from "../state/access/UserStateAccess";

export class AuthProvider {

    getToken(): string | null {
        return UserStateAccess.getAuthTokenOrNull();
    }

}