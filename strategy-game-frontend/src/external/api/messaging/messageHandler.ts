import {SetGameStateAction} from "../../../core/actions/gamelobby/setGameStateAction";
import {PayloadInitGameState} from "../../../models/messaging/payloadInitGameState";
import {PayloadInitTurnState} from "../../../models/messaging/payloadInitTurnState";


export class MessageHandler {

    private readonly gameSetState: SetGameStateAction;

    constructor(gameSetState: SetGameStateAction) {
        this.gameSetState = gameSetState;
    }


    onMessage(type: string, payload: any): void {
        console.log("Received message", type, payload);
        if (type === "world-state") {
            this.onWorldState(payload);
        }
        if (type === "turn-result") {
            this.onTurnResult(payload);
        }
    }

    onWorldState(payload: PayloadInitGameState) {
        this.gameSetState.perform(payload.game);
    }

    onTurnResult(payload: PayloadInitTurnState) {
        this.gameSetState.perform(payload.game);
    }

}