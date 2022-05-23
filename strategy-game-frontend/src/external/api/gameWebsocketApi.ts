import {CommandPlaceMarker} from "../../ports/models/CommandPlaceMarker";
import {GameMessagingApi} from "../../ports/required/api/gameMessagingApi";
import {AuthProvider} from "../../ports/required/state/authProvider";
import {MessageHandler} from "./messageHandler";
import {WebsocketClient} from "./websocketClient";

export class GameWebsocketApi implements GameMessagingApi {

    private readonly websocketClient: WebsocketClient;
    private readonly authProvider: AuthProvider;
    private readonly messageHandler: MessageHandler;

    constructor(websocketClient: WebsocketClient, authProvider: AuthProvider, messageHandler: MessageHandler) {
        this.websocketClient = websocketClient;
        this.authProvider = authProvider;
        this.messageHandler = messageHandler;
    }

    open(gameId: string): Promise<void> {
        return this.websocketClient.open(`/api/game/${gameId}?token=${this.authProvider.getToken()}`, message => {
            this.messageHandler.onMessage(message.type, JSON.parse(message.payload));
        });
    }

    close(): void {
        this.websocketClient.close();
    }

    sendSubmitTurn(commands: CommandPlaceMarker[]): void {
        this.websocketClient.send("submit-turn", {
            commands: commands
        });
    }

}
