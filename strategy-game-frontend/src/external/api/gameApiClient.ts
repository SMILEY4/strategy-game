import {GameApi} from "../../ports/required/api/gameApi";
import {AuthProvider} from "../../ports/required/state/authProvider";
import {HttpClient} from "./httpClient";

export class GameApiClient implements GameApi {

    private readonly httpClient: HttpClient;
    private readonly authProvider: AuthProvider;

    constructor(httpClient: HttpClient, authProvider: AuthProvider) {
        this.httpClient = httpClient;
        this.authProvider = authProvider;
    }


    create(): Promise<string> {
        return this.httpClient
            .post({
                url: "/api/game/create",
                requireAuth: true,
                token: this.authProvider.getToken()
            })
            .then(response => response.text());
    }


    join(gameId: string): Promise<void> {
        return this.httpClient
            .post({
                url: `/api/game/join/${gameId}`,
                requireAuth: true,
                token: this.authProvider.getToken()
            })
            .then(() => undefined);
    }


    list(): Promise<string[]> {
        return this.httpClient
            .get({
                url: "/api/game/list/",
                requireAuth: true,
                token: this.authProvider.getToken()
            })
            .then(response => response.json());
    }

}
