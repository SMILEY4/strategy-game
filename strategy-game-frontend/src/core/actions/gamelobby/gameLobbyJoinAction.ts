import {GameApi} from "../../../external/api/gameApi";

export class GameLobbyJoinAction {

    private readonly gameApi: GameApi;

    constructor(gameApi: GameApi) {
        this.gameApi = gameApi;
    }

    perform(gameId: string): Promise<void> {
        console.debug("Joining game-lobby")
        return this.gameApi.join(gameId);
    }

}