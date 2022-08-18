import {GameConfig} from "../../../models/state/gameConfig";
import {UserStateAccess} from "../../state/user/userStateAccess";
import {HttpClient} from "./httpClient";

export class GameApi {

    private readonly httpClient: HttpClient;
    private readonly userStateAccess: UserStateAccess;

    constructor(httpClient: HttpClient, userStateAccess: UserStateAccess) {
        this.httpClient = httpClient;
        this.userStateAccess = userStateAccess;
    }


    create(): Promise<string> {
        return this.httpClient
            .post({
                url: "/api/game/create",
                requireAuth: true,
                token: this.userStateAccess.getToken()
            })
            .then(response => response.text());
    }


    join(gameId: string): Promise<void> {
        return this.httpClient
            .post({
                url: `/api/game/join/${gameId}`,
                requireAuth: true,
                token: this.userStateAccess.getToken()
            })
            .then(() => undefined);
    }


    list(): Promise<string[]> {
        return this.httpClient
            .get({
                url: "/api/game/list",
                requireAuth: true,
                token: this.userStateAccess.getToken()
            })
            .then(response => response.json());
    }

    config(): Promise<GameConfig> {
        return this.httpClient
            .get({
                url: "/api/game/config",
                requireAuth: true,
                token: this.userStateAccess.getToken()
            })
            .then(response => response.json());
    }

}
