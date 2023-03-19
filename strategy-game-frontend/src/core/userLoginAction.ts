import {GameApi} from "./required/gameApi";
import {GameConfigRepository} from "./required/gameConfigRepository";
import {UserApi} from "./required/userApi";
import {UserRepository} from "./required/userRepository";

/**
 * Login
 */
export class UserLoginAction {

    private readonly userApi: UserApi;
    private readonly gameApi: GameApi;
    private readonly userRepository: UserRepository;
    private readonly gameConfigRepository: GameConfigRepository;

    constructor(userApi: UserApi, gameApi: GameApi, userRepository: UserRepository, gameConfigRepository: GameConfigRepository) {
        this.userApi = userApi;
        this.gameApi = gameApi;
        this.userRepository = userRepository;
        this.gameConfigRepository = gameConfigRepository;
    }

    perform(email: string, password: string): Promise<void> {
        console.debug("Logging in");
        return this.userApi.login(email, password).then((token: string) => {
            this.userRepository.setAuthToken(token);
            this.gameApi.config()
                .then(config => this.gameConfigRepository.setConfig(config));
        });
    }

}