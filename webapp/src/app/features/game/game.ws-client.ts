import type {WebsocketClient, WebsocketConnectionHandle} from "@modules/client/websocket-client.ts";
import type {GameWebsocketClientMessage, GameWebsocketServerMessage} from "@app/game/game-websocket-message.ts";

export interface GameWebsocketClient {
    connect: (gameId: string) => WebsocketConnectionHandle<GameWebsocketClientMessage>
}

interface Dependencies {
    wsClient: WebsocketClient;
}

export const gameWebsocketClient = ({wsClient}: Dependencies): GameWebsocketClient => ({

    connect: (gameId: string) => {
        return wsClient.open<GameWebsocketServerMessage, GameWebsocketClientMessage>({
            url: `/api/game/${gameId}`,
            key: "game#" + gameId,
            onOpen: () => {},
            onClose: () => {},
            onError: () => {},
            onMessage: () => {},
        })
    },

});