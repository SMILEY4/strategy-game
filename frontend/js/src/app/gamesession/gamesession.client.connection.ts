import {Game} from "../../models/misc/game";
import {GameSessionClient} from "./gamesession.client";
import {GameStateMessage} from "../../models/messages/gameStateMessage";
import {CommandMessage} from "../../models/messages/commandMessage";
import {gameSessionWebsocketClient} from "../../main";

export namespace GameSessionClientTypes {

    export interface ClientMessage {
        messageType: "submit-turn",
        commands: (CommandMessage | unknown)[] // todo: remove unknown when possible
    }

    export interface ServerMessage {
        messageType: "game-state",
        state: GameStateMessage
    }

}

export const GameSessionConnectionClient = {

    open(game: Game.Id, consumer: (message: GameSessionClientTypes.ServerMessage) => void): Promise<void> {
        return GameSessionClient
            .getWebsocketTicket(game)
            .then(token => {
                return gameSessionWebsocketClient.open(
                    `/api/session/events?token=${token}`,
                    message => consumer(message as GameSessionClientTypes.ServerMessage),
                );
            });
    },

    close() {
        gameSessionWebsocketClient.close();
    },

    send(message: GameSessionClientTypes.ClientMessage) {
        gameSessionWebsocketClient.send(message);
    },

};