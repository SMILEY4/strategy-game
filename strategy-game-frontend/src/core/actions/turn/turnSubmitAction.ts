import {GameMessagingApi} from "../../../external/api/gameMessagingApi";
import {GameStateAccess} from "../../../external/state/game/gameStateAccess";

export class TurnSubmitAction {

    private readonly gameStateAccess: GameStateAccess;
    private readonly gameMsgApi: GameMessagingApi;

    constructor(gameStateAccess: GameStateAccess, gameMsgApi: GameMessagingApi) {
        this.gameStateAccess = gameStateAccess;
        this.gameMsgApi = gameMsgApi;
    }


    perform(): void {
        console.debug("Submitting turn")
        if(this.gameStateAccess.getCurrentState() == "active") {
            const commands = this.gameStateAccess.getCommands();
            this.gameMsgApi.sendSubmitTurn(commands);
            this.gameStateAccess.setTurnState("submitted")
        }
    }

}