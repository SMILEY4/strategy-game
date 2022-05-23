import {UserSignUpAction} from "../../../ports/provided/user/userSignUpAction";
import {UserApi} from "../../../ports/required/api/userApi";

export class UserSignUpActionImpl implements UserSignUpAction {

    private readonly userApi: UserApi;


    constructor(userApi: UserApi) {
        this.userApi = userApi;
    }

    perform(email: string, password: string, username: string): Promise<void> {
        console.debug("Sign-Up as new user")
        return this.userApi.signUp(email, password, username);
    }

}