import type {HiddenType} from "@app/features/game/models/hidden-type.ts";

/** Messages sent from client to server over the game WebSocket. */
export type GameWebsocketClientMessage = null

export interface GameWebsocketClientMessageBase {
    type: string;
}


/** Messages sent from server to client over the game WebSocket. */
export type GameWebsocketServerMessage =
    | GameState

interface GameWebsocketServerMessageBase {
    type: string;
}

interface GameState extends GameWebsocketServerMessageBase {
    type: "io.github.smiley4.strategygame.engine.routing.GameWebsocketRoute.ServerGameMessage.GameState",
    stateJson: {
        game: {
            turn: number
        },
        tiles: ({
            id: string,
            position: {
                q: number,
                r: number
            },
            chunk: {
                q: number,
                r: number
            },
            visibility: 0 | 1
            world: HiddenType<{
                biome: string,
                elevation: string,
                feature: string,
                resources: ({
                    type: string,
                    amount: number,
                    maxAmount: number,
                    changeRate: number,
                    removeOnDeplete: number
                })[]
            }>
            meta: {
                seed: number,
            },
        })[]
    }
}