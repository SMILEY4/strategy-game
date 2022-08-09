import {UserApi} from "../../../external/api/http/userApi";
import {UserStateAccess} from "../../../external/state/user/userStateAccess";
import {AuthData} from "../../../models/authData";

/**
 * Login
 */
export class UserLoginAction {

    private readonly userApi: UserApi;
    private readonly userStateAccess: UserStateAccess;

    constructor(userApi: UserApi, userStateAccess: UserStateAccess) {
        this.userApi = userApi;
        this.userStateAccess = userStateAccess;
    }

    perform(email: string, password: string): Promise<void> {
        console.debug("Logging in")
        return this.userApi.login(email, password).then((authData: AuthData) => {
            this.userStateAccess.setAuth(authData.idToken);
        });
    }

}