import type {GameWebsocketClient} from "@app/features/game/game.ws-client.ts";
import type {GameWebsocketServerMessage} from "@app/features/game/game-websocket-message.ts";
import type {GameClient} from "@app/features/game/game.client.ts";
import type {GameRepository} from "@app/features/game/game.repository.ts";
import {type TileDatabase} from "@app/features/game/database/tile.database.ts";
import type {CameraController} from "@app/features/game/gameplay/camera/camera-controller.ts";
import type {GameActionClickTile} from "@app/features/game/gameplay/game-action.click-tile.ts";
import {type EntityDatabase} from "@app/features/game/database/entity.database.ts";
import {databaseBatch} from "@modules/gamedb/subscribers/batch.ts";
import {type GameActionJoinedGame} from "@app/features/game/gameplay/game-action.joined-game.ts";
import type {PointerPositionDatabase} from "@app/features/game/database/pointer-position.database.ts";

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
    pointerPositionDb: PointerPositionDatabase,
    tileDb: TileDatabase,
    entityDb: EntityDatabase,
    cameraController: CameraController
    actionClickTile: GameActionClickTile,
    actionJoinedGame: GameActionJoinedGame
}

export const gameEngine = (dependencies: Dependencies): GameEngine => {

    const {
        client,
        wsClient,
        repository,
        pointerPositionDb,
        tileDb,
        entityDb,
        cameraController,
        actionClickTile,
        actionJoinedGame,
    } = dependencies;

    const instance = {

        start: async (gameId: string) => {
            repository.setState("loading");
            try {
                const token = await client.getGameWebsocketToken();
                wsClient.connect(gameId, token, instance.onMessage);
            } catch (e) {
                console.error("Failed to start game", e);
                repository.setState("error");
            }
        },

        stop: () => {
            repository.setState("loading");
            wsClient.disconnect();
            cameraController.dispose();
        },

        onMessage: (message: GameWebsocketServerMessage) => {
            console.log("received message", message);
            if (message.type === "ServerGameMessage.GameState") {
                databaseBatch([tileDb, entityDb], () => {
                    tileDb.deleteAll();
                    tileDb.insertMany(message.state.tiles);
                    entityDb.deleteAll();
                    entityDb.insertMany(message.state.entities);
                });
                if (repository.getState() === "loading") {
                    repository.setState("playing");
                    cameraController.initialize();
                    actionJoinedGame.execute();
                }
            }
        },

        onUpdate: () => {
            cameraController.update();
        },

        onResize: (width: number, height: number) => {
            cameraController.onResize(width, height);
        },

        onMouseMove: (mx: number, my: number, x: number, y: number, buttons: number) => {
            const worldPosition = cameraController.transformScreenToWorld(x, y)
            const hexPosition = cameraController.transformScreenToHex(x, y)
            pointerPositionDb.set({
                screen: [x, y],
                world: worldPosition,
                hex: [hexPosition.q, hexPosition.r]
            })
            cameraController.onMouseMove(mx, my, x, y, buttons);
        },

        onCanvasClick: (x: number, y: number) => {
            const hexPosition = cameraController.transformScreenToHex(x, y);
            actionClickTile.click(hexPosition);
        },

        onScroll: (delta: number, x: number, y: number) => {
            cameraController.onScroll(delta, x, y);
        },

    };
    return instance;
};