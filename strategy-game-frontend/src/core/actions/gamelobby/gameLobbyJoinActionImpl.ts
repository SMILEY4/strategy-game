import {GameLobbyJoinAction} from "../../../ports/provided/gamelobby/gameLobbyJoinAction";
import {GameApi} from "../../../ports/required/api/gameApi";

export class GameLobbyJoinActionImpl implements GameLobbyJoinAction {

    private readonly gameApi: GameApi;

    constructor(gameApi: GameApi) {
        this.gameApi = gameApi;
    }

    perform(gameId: string): Promise<void> {
        console.debug("Joining game-lobby")
        return this.gameApi.join(gameId);
    }

}