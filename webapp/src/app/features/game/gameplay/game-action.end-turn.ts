import {type CommandDatabase} from "@app/features/game/database/command.database.ts";
import type {GameWebsocketClient} from "@app/features/game/game.ws-client.ts";
import {assertExhaustive} from "@modules/utilities/assert-exhaustive.ts";

export interface GameActionEndTurn {
    execute: () => void;
}

interface Dependencies {
    commandDb: CommandDatabase;
    wsClient: GameWebsocketClient;
}

export const gameActionEndTurn = ({commandDb, wsClient}: Dependencies): GameActionEndTurn => ({
    execute: () => {
        const pendingCommands = commandDb.deleteAll();
        wsClient.send({
            type: "ClientGameMessage.SubmitTurn",
            commands: pendingCommands.map(command => {
                if(command.type === "found-capital") {
                    return {
                        type: "FoundRealmCapital",
                        q: command.location.q,
                        r: command.location.r,
                        name: command.name
                    }
                }
                assertExhaustive(command.type)
            }),
        });
    },
});