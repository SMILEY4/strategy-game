import {LocalGameStateAccess} from "../external/state/localgame/localGameStateAccess";
import {GameState} from "../models/state/gameState";
import {GameApi} from "./required/gameApi";

/**
 * Submit and end the turn
 */
export class TurnSubmitAction {

    private readonly localGameStateAccess: LocalGameStateAccess;
    private readonly gameApi: GameApi;

    constructor(gameStateAccess: LocalGameStateAccess, gameApi: GameApi) {
        this.localGameStateAccess = gameStateAccess;
        this.gameApi = gameApi;
    }

    perform(): void {
        if (this.localGameStateAccess.getCurrentState() == GameState.PLAYING) {
            const commands = this.localGameStateAccess.getCommands();
            console.log("submit turn", commands);
            this.gameApi.submitTurn(commands);
            this.localGameStateAccess.setCurrentState(GameState.SUBMITTED);
        }
    }

}