import {GameLobbyCreateAction} from "../../../ports/provided/gamelobby/gameLobbyCreateAction";
import {GameApi} from "../../../ports/required/api/gameApi";

export class GameLobbyCreateActionImpl implements GameLobbyCreateAction {

    private readonly gameApi: GameApi;

    constructor(gameApi: GameApi) {
        this.gameApi = gameApi;
    }

    perform(): Promise<string> {
        return this.gameApi.create();
    }

}