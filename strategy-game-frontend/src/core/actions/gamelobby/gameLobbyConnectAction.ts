import {GameMessagingApi} from "../../../external/api/messaging/gameMessagingApi";
import {LocalGameStateAccess} from "../../../external/state/localgame/localGameStateAccess";
import {GameState} from "../../../models/state/gameState";

/**
 * Connect to a game
 */
export class GameLobbyConnectAction {

    private readonly gameMsgApi: GameMessagingApi;
    private readonly gameStateAccess: LocalGameStateAccess;

    constructor(gameMsgApi: GameMessagingApi, gameStateAccess: LocalGameStateAccess) {
        this.gameMsgApi = gameMsgApi;
        this.gameStateAccess = gameStateAccess;
    }

    perform(gameId: string): Promise<void> {
        console.log("connect to game ", gameId)
        return this.gameMsgApi.open(gameId).then(() => {
            this.gameStateAccess.setCurrentState(GameState.LOADING);
        });
    }

}