import {Command, CommandCreateCity, CommandPlaceMarker, CommandPlaceScout} from "../../../models/state/command";
import {UserStateAccess} from "../../state/user/userStateAccess";
import {MessageHandler} from "./messageHandler";
import {WebsocketClient} from "./websocketClient";

export class GameMessagingApi {

    private readonly websocketClient: WebsocketClient;
    private readonly userStateAccess: UserStateAccess;
    private readonly messageHandler: MessageHandler;

    constructor(websocketClient: WebsocketClient, userStateAccess: UserStateAccess, messageHandler: MessageHandler) {
        this.websocketClient = websocketClient;
        this.userStateAccess = userStateAccess;
        this.messageHandler = messageHandler;
    }

    open(gameId: string): Promise<void> {
        const url = `/api/game/${gameId}?token=${this.userStateAccess.getToken()}`;
        console.log("open websocket-connection:", url);
        return this.websocketClient.open(url, message => {
            this.messageHandler.onMessage(message.type, message.payload);
        });
    }

    close(): void {
        this.websocketClient.close();
    }

    sendSubmitTurn(commands: Command[]): void {
        this.websocketClient.send("submit-turn", {
                commands: commands.map(cmd => {
                    if (cmd.commandType === "place-marker") {
                        const cmdPlaceMarker = cmd as CommandPlaceMarker;
                        return {
                            type: "place-marker",
                            q: cmdPlaceMarker.q,
                            r: cmdPlaceMarker.r,
                        };
                    }
                    if (cmd.commandType === "place-scout") {
                        const cmdPlaceScout = cmd as CommandPlaceScout;
                        return {
                            type: "place-scout",
                            q: cmdPlaceScout.q,
                            r: cmdPlaceScout.r,
                        };
                    }
                    if (cmd.commandType === "create-city") {
                        const cmdCreateCity = cmd as CommandCreateCity;
                        return {
                            type: "create-city",
                            name: cmdCreateCity.name,
                            q: cmdCreateCity.q,
                            r: cmdCreateCity.r,
                            parentCity: cmdCreateCity.parentCity
                        };
                    }
                    return undefined;
                })
            }
        );
    }

}
