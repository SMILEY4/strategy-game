import {GameApi} from "../../../external/api/http/gameApi";

/**
 * Join a game as a player (dont connect yet)
 */
export class GameLobbyJoinAction {

    private readonly gameApi: GameApi;

    constructor(gameApi: GameApi) {
        this.gameApi = gameApi;
    }

    perform(gameId: string): Promise<void> {
        console.debug("Joining game", gameId)
        return this.gameApi.join(gameId);
    }

}