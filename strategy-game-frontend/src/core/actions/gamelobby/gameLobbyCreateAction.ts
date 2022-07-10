import {GameApi} from "../../../external/api/gameApi";

export class GameLobbyCreateAction {

    private readonly gameApi: GameApi;

    constructor(gameApi: GameApi) {
        this.gameApi = gameApi;
    }

    perform(): Promise<string> {
        console.debug("Creating game-lobby")
        return this.gameApi.create();
    }

}