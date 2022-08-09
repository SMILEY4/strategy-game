import {SetInitWorldStateAction} from "../../../core/actions/gamelobby/SetInitWorldStateAction";
import {TurnUpdateWorldStateAction} from "../../../core/actions/turn/turnUpdateWorldStateAction";
import {PayloadInitTurnState} from "../../../models/messaging/payloadInitTurnState";
import {PayloadInitGameState} from "../../../models/messaging/payloadInitGameState";


export class MessageHandler {

    private readonly setInitWorldStateAction: SetInitWorldStateAction;
    private readonly turnUpdateWorldState: TurnUpdateWorldStateAction;

    constructor(setInitWorldStateAction: SetInitWorldStateAction, turnUpdateWorldState: TurnUpdateWorldStateAction) {
        this.setInitWorldStateAction = setInitWorldStateAction;
        this.turnUpdateWorldState = turnUpdateWorldState;
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
        this.setInitWorldStateAction.perform(payload);
    }

    onTurnResult(payload: PayloadInitTurnState) {
        this.turnUpdateWorldState.perform(payload);
    }

}