import {UserApi} from "../../../external/api/http/userApi";

/**
 * Create a new account
 */
export class UserSignUpAction {

    private readonly userApi: UserApi;


    constructor(userApi: UserApi) {
        this.userApi = userApi;
    }

    perform(email: string, password: string, username: string): Promise<void> {
        console.debug("Sign-Up as new user")
        return this.userApi.signUp(email, password, username);
    }

}