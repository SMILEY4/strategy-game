import {TurnSubmitAction} from "../../../ports/provided/turn/turnSubmitAction";
import {GameMessagingApi} from "../../../ports/required/api/gameMessagingApi";
import {GameStateAccess} from "../../../ports/required/state/gameStateAccess";

export class TurnSubmitActionImpl implements TurnSubmitAction {

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