import type {HttpClient} from "@modules/client/http-client.ts";

export interface GameClient {
    getGameWebsocketToken(): Promise<string>;
    getSettlementName(gameId: string): Promise<string>;
}

interface Dependencies {
    httpClient: HttpClient;
}


export const gameClient = ({httpClient}: Dependencies): GameClient => ({

    getGameWebsocketToken: () => {
        return httpClient.get<{ token: string }>({
            url: "/api/identity/onetimegrant",
            authenticated: true,
        }).then(response => response.token);
    },

    getSettlementName: (gameId: string) => {
        return httpClient.get<{ name: string }>({
            url: `/api/engine/game/${gameId}/settlementname`,
            authenticated: true,
        }).then(response => response.name);
    },

});