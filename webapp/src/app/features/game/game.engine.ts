import type {GameWebsocketClient} from "@app/features/game/game.ws-client.ts";
import type {GameWebsocketServerMessage} from "@app/features/game/game-websocket-message.ts";
import type {GameClient} from "@app/features/game/game.client.ts";
import type {GameRepository} from "@app/features/game/game.repository.ts";
import {type TileDatabase} from "@app/features/game/database/tile.database.ts";
import type {CameraController} from "@app/features/game/gameplay/camera/camera-controller.ts";
import type {GameActionClickTile} from "@app/features/game/gameplay/game-action.click-tile.ts";
import {type EntityDatabase} from "@app/features/game/database/entity.database.ts";
import {databaseBatch} from "@modules/gamedb/subscribers/batch.ts";

/** Orchestrates the game lifecycle: connecting via WebSocket and routing messages to the database. */
export interface GameEngine {
    start: (gameId: string) => void;
    stop: () => void;
    onMessage: (message: GameWebsocketServerMessage) => void;
    onUpdate: () => void;
    onResize: (width: number, height: number) => void;
    onMouseMove: (mx: number, my: number, x: number, y: number, buttons: number) => void;
    onCanvasClick: (x: number, y: number) => void;
    onScroll: (delta: number, x: number, y: number) => void;
}

interface Dependencies {
    client: GameClient,
    wsClient: GameWebsocketClient;
    repository: GameRepository;
    tileDb: TileDatabase,
    entityDb: EntityDatabase,
    cameraController: CameraController
    actionClickTile: GameActionClickTile
}

export const gameEngine = ({client, wsClient, repository, tileDb, entityDb, cameraController, actionClickTile}: Dependencies): GameEngine => {
    const instance = {

        start: async (gameId: string) => {
            repository.setState("loading");
            const token = await client.getGameWebsocketToken();
            wsClient.connect(gameId, token, instance.onMessage);
        },

        stop: () => {
            repository.setState("loading");
            wsClient.disconnect();
            cameraController.dispose();
        },

        onMessage: (message: GameWebsocketServerMessage) => {
            console.log("received message", message)
            if (message.type === "ServerGameMessage.GameState") {
                databaseBatch([tileDb, entityDb], () => {
                    tileDb.deleteAll();
                    tileDb.insertMany(message.state.tiles);
                    entityDb.deleteAll()
                    entityDb.insertMany(message.state.entities);
                })
                if (repository.getState() === "loading") {
                    repository.setState("playing");
                    cameraController.initialize();
                }
            }
        },

        onUpdate: () => {
            cameraController.update()
        },

        onResize: (width: number, height: number) => {
            cameraController.onResize(width, height);
        },

        onMouseMove: (mx: number, my: number, x: number, y: number, buttons: number) => {
            cameraController.onMouseMove(mx, my, x, y, buttons);
        },

        onCanvasClick: (x: number, y: number) => {
            const hexPosition = cameraController.transformScreenToHex(x, y);
            actionClickTile.click(hexPosition)
        },

        onScroll: (delta: number, x: number, y: number) => {
            cameraController.onScroll(delta, x, y);
        }

    };
    return instance;
};