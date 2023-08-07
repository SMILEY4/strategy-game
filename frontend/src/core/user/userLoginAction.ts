import {UserApi} from "../required/userApi";
import {UserRepository} from "../required/userRepository";

/**
 * Login
 */
export class UserLoginAction {

    private readonly userApi: UserApi;
    private readonly userRepository: UserRepository;

    constructor(userApi: UserApi, userRepository: UserRepository) {
        this.userApi = userApi;
        this.userRepository = userRepository;
    }

    perform(email: string, password: string): Promise<void> {
        console.debug("Logging in");
        return this.userApi.login(email, password)
            .then(data => this.userRepository.setAuthToken(data.idToken));
    }

}