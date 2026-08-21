import type {WebsocketClient} from "@modules/client/websocket-client.ts";
import type {GameWebsocketClientMessage, GameWebsocketServerMessage} from "@app/features/game/game-websocket-message.ts";

/** WebSocket client for game connections, using one-time token auth. */
export interface GameWebsocketClient {
    connect: (gameId: string, token: string, onMessage: (message: GameWebsocketServerMessage) => void) => void
    disconnect: () => void,
    send: (message: GameWebsocketClientMessage) => void
}

interface Dependencies {
    wsClient: WebsocketClient;
}


const GAME_CONNECTION_KEY = "game";

export const gameWebsocketClient = ({wsClient}: Dependencies): GameWebsocketClient => ({

    connect: (gameId: string, token: string, onMessage: (message: GameWebsocketServerMessage) => void) => {
        wsClient.open<GameWebsocketServerMessage, GameWebsocketClientMessage>({
            url: `/api/engine/game/${gameId}`,
            queryParams: {
                token: token,
            },
            key: GAME_CONNECTION_KEY,
            onOpen: () => undefined,
            onClose: () => undefined,
            onError: () => undefined,
            onMessage: (message, _handle) => onMessage(message),
        });
    },

    disconnect: () => {
        wsClient.close(GAME_CONNECTION_KEY);
    },

    send: (message: GameWebsocketClientMessage) => {
        wsClient.send(GAME_CONNECTION_KEY, message);
    },

});