import {HttpWebsocketClient} from "../http/http.ws.client";
import {App} from "../../appContext";
import {Game} from "../../models/misc/game";
import {GameSessionClient} from "./gamesession.client";
import {GameStateMessage} from "../../models/messages/gameStateMessage";
import {CommandMessage} from "../../models/messages/commandMessage";

const websocketClient = new HttpWebsocketClient(App.WS_BASE_URL);

export namespace GameSessionClientTypes {

    export interface BaseMessage {
        type: string;
        payload: any;
    }

    type EnforceBaseMessage<T extends BaseMessage> = T;

    export type ServerMessage = EnforceBaseMessage<
        {
            type: "game-state",
            payload: GameStateMessage
        }
    >

    export type ClientMessage = EnforceBaseMessage<
        {
            type: "submit-turn",
            payload: {
                commands: (CommandMessage | unknown)[] // todo: remove unknown when possible
            }
        }
    >

}

export const GameSessionConnectionClient = {

    open(game: Game.Id, consumer: (message: GameSessionClientTypes.ServerMessage) => void): Promise<void> {
        return GameSessionClient
            .getWebsocketTicket()
            .then(ticket => {
                return websocketClient.open(
                    `/api/session/connect/${game}?ticket=${ticket}`,
                    message => consumer(message as GameSessionClientTypes.ServerMessage),
                );
            });
    },

    close() {
        websocketClient.close();
    },

    send(message: GameSessionClientTypes.ClientMessage) {
        websocketClient.send(message);
    },

};