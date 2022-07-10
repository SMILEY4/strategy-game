import {CommandPlaceMarker} from "../../models/commandPlaceMarker";
import {AuthProvider} from "../state/user/authProvider";
import {MessageHandler} from "./messageHandler";
import {WebsocketClient} from "./websocketClient";

export class GameMessagingApi {

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
            this.messageHandler.onMessage(message.type, message.payload);
        });
    }

    close(): void {
        this.websocketClient.close();
    }

    sendSubmitTurn(commands: CommandPlaceMarker[]): void {
        const userId = this.authProvider.getUserId();
        this.websocketClient.send("submit-turn", {
            commands: commands.map(cmd => ({
                q: cmd.q,
                r: cmd.r,
                userId: userId
            }))
        });
    }

}
