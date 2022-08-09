import {GameMessagingApi} from "../../../external/api/messaging/gameMessagingApi";
import {LocalGameStateAccess} from "../../../external/state/localgame/localGameStateAccess";
import {GameState} from "../../../models/state/gameState";

/**
 * Submit and end the turn
 */
export class TurnSubmitAction {

    private readonly gameStateAccess: LocalGameStateAccess;
    private readonly gameMsgApi: GameMessagingApi;

    constructor(gameStateAccess: LocalGameStateAccess, gameMsgApi: GameMessagingApi) {
        this.gameStateAccess = gameStateAccess;
        this.gameMsgApi = gameMsgApi;
    }

    perform(): void {
        console.log("submit turn")
        if (this.gameStateAccess.getCurrentState() == GameState.PLAYING) {
            const commands = this.gameStateAccess.getCommands();
            this.gameMsgApi.sendSubmitTurn(commands);
            this.gameStateAccess.setCurrentState(GameState.SUBMITTED);
        }
    }

}