import {LocalGameStateAccess} from "../external/state/localgame/localGameStateAccess";
import {GameState} from "../models/state/gameState";
import {GameApi} from "./required/gameApi";

/**
 * Connect to a game
 */
export class GameConnectAction {

    private readonly gameApi: GameApi;
    private readonly gameStateAccess: LocalGameStateAccess;

    constructor(gameApi: GameApi, gameStateAccess: LocalGameStateAccess) {
        this.gameApi = gameApi;
        this.gameStateAccess = gameStateAccess;
    }

    perform(gameId: string): Promise<void> {
        console.log("connect to game ", gameId);
        return this.gameApi.connect(gameId).then(() => {
            this.gameStateAccess.setCurrentState(GameState.LOADING);
        });
    }

}