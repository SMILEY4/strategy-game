import {GameApi} from "../../../external/api/http/gameApi";
import {UserApi} from "../../../external/api/http/userApi";
import {GameConfigStateAccess} from "../../../external/state/gameconfig/gameConfigStateAccess";
import {UserStateAccess} from "../../../external/state/user/userStateAccess";
import {AuthData} from "../../../models/authData";

/**
 * Login
 */
export class UserLoginAction {

    private readonly userApi: UserApi;
    private readonly gameApi: GameApi;
    private readonly userStateAccess: UserStateAccess;
    private readonly gameConfigStateAccess: GameConfigStateAccess;

    constructor(userApi: UserApi, gameApi: GameApi, userStateAccess: UserStateAccess, gameConfigStateAccess: GameConfigStateAccess) {
        this.userApi = userApi;
        this.gameApi = gameApi;
        this.userStateAccess = userStateAccess;
        this.gameConfigStateAccess = gameConfigStateAccess;
    }

    perform(email: string, password: string): Promise<void> {
        console.debug("Logging in");
        return this.userApi.login(email, password).then((authData: AuthData) => {
            this.userStateAccess.setAuth(authData.idToken);
            this.gameApi.config()
                .then(config => this.gameConfigStateAccess.setGameConfig(config));
        });
    }

}