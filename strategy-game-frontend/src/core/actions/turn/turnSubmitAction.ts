import {GameMessagingApi} from "../../../external/api/messaging/gameMessagingApi";
import {LocalGameStateAccess} from "../../../external/state/localgame/localGameStateAccess";
import {GameState} from "../../../models/state/gameState";

/**
 * Submit and end the turn
 */
export class TurnSubmitAction {

    private readonly localGameStateAccess: LocalGameStateAccess;
    private readonly gameMsgApi: GameMessagingApi;

    constructor(gameStateAccess: LocalGameStateAccess, gameMsgApi: GameMessagingApi) {
        this.localGameStateAccess = gameStateAccess;
        this.gameMsgApi = gameMsgApi;
    }

    perform(): void {
        if (this.localGameStateAccess.getCurrentState() == GameState.PLAYING) {
            const commands = this.localGameStateAccess.getCommands();
            console.log("submit turn", commands);
            this.gameMsgApi.sendSubmitTurn(commands);
            this.localGameStateAccess.setCurrentState(GameState.SUBMITTED);
        }
    }

}