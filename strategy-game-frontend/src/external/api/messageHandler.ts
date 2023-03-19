import {GameSetStateAction} from "../../core/gameSetStateAction";
import {PayloadGameState} from "./models/payloadGameState";


export class MessageHandler {

    private readonly gameSetState: GameSetStateAction;

    constructor(gameSetState: GameSetStateAction) {
        this.gameSetState = gameSetState;
    }


    onMessage(type: string, payload: any): void {
        console.log("Received message", type, payload);
        if (type === "game-state") {
            this.onWorldState(payload.game);
        }
    }


    onWorldState(payload: PayloadGameState) {
        this.gameSetState.perform(payload);
    }

}