import {WebsocketMessageHandler} from "../../shared/websocketMessageHandler";
import {NextTurnService} from "../game/nextTurnService";

export class GameSessionMessageHandler implements WebsocketMessageHandler {

    private readonly nextTurnService: NextTurnService;

    constructor(nextTurnService: NextTurnService) {
        this.nextTurnService = nextTurnService;
    }

    public onMessage(type: string, payload: any): void {
        console.log("received message", type, payload);
        if (type === "game-state") {
            this.nextTurnService.handleNextTurn(payload);
        }
    }

}