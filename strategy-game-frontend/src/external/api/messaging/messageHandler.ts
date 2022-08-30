import {SetGameStateAction} from "../../../core/actions/gamelobby/setGameStateAction";
import {PayloadGameState} from "../../../models/messaging/payloadGameState";


export class MessageHandler {

    private readonly gameSetState: SetGameStateAction;

    constructor(gameSetState: SetGameStateAction) {
        this.gameSetState = gameSetState;
    }


    onMessage(type: string, payload: any): void {
        console.log("Received message", type, payload);
        if (type === "game-state") {
            this.onWorldState(payload);
        }
    }

    onWorldState(payload: PayloadGameState) {
        this.gameSetState.perform(payload.game);
    }

}