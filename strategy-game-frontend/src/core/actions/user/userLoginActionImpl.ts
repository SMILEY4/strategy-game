import {AuthData} from "../../../ports/models/authData";
import {UserLoginAction} from "../../../ports/provided/user/userLoginAction";
import {UserApi} from "../../../ports/required/api/userApi";
import {UserStateAccess} from "../../../ports/required/state/userStateAccess";

export class UserLoginActionImpl implements UserLoginAction {

    private readonly userApi: UserApi;
    private readonly userStateAccess: UserStateAccess;

    constructor(userApi: UserApi, userStateAccess: UserStateAccess) {
        this.userApi = userApi;
        this.userStateAccess = userStateAccess;
    }

    perform(email: string, password: string): Promise<void> {
        return this.userApi.login(email, password).then((authData: AuthData) => {
            this.userStateAccess.setAuth(authData.idToken);
        });
    }

}