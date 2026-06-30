import type {GameWebsocketClient} from "@app/features/game/game.ws-client.ts";
import type {GameWebsocketServerMessage} from "@app/features/game/game-websocket-message.ts";
import type {GameClient} from "@app/features/game/game.client.ts";
import type {GameRepository} from "@app/features/game/game.repository.ts";
import {type TileDatabase} from "@app/features/game/database/tile.database.ts";

export interface GameEngine {
    start: (gameId: string) => void;
    stop: () => void;
    onMessage: (message: GameWebsocketServerMessage) => void;
}

interface Dependencies {
    client: GameClient,
    wsClient: GameWebsocketClient;
    repository: GameRepository;
    tileDb: TileDatabase
}

export const gameEngine = ({client, wsClient, repository, tileDb}: Dependencies): GameEngine => {
    const instance = {

        start: async (gameId: string) => {
            repository.setState("loading");
            const token = await client.getGameWebsocketToken();
            wsClient.connect(gameId, token, instance.onMessage);
        },

        stop: () => {
            repository.setState("loading");
            wsClient.disconnect();
        },

        onMessage: (message: GameWebsocketServerMessage) => {
            if (message.type === "io.github.smiley4.strategygame.engine.routing.GameWebsocketRoute.ServerGameMessage.GameState") {
                tileDb.batch(() => {
                    tileDb.deleteAll();
                    tileDb.insertMany(message.stateJson.tiles);
                });
                if (repository.getState() === "loading") {
                    repository.setState("playing");
                }
            }
        },

    };
    return instance;
};