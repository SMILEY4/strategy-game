import type {HiddenType} from "@app/features/game/models/hidden-type.ts";

/** Messages sent from client to server over the game WebSocket. */
export type GameWebsocketClientMessage =
    | SubmitTurn

export interface GameWebsocketClientMessageBase {
    type: string;
}

interface SubmitTurn extends GameWebsocketClientMessageBase {
    type: "ClientGameMessage.SubmitTurn",
    commands: MessageCommand[]
}

type MessageCommand =
    | { type: "CreateSettlement", q: number, r: number, name: string }


/** Messages sent from server to client over the game WebSocket. */
export type GameWebsocketServerMessage =
    | GameState

interface GameWebsocketServerMessageBase {
    type: string;
}

interface GameState extends GameWebsocketServerMessageBase {
    type: "ServerGameMessage.GameState",
    state: {
        game: {
            turn: number
        },
        tiles: ({
            id: number,
            visibility: "VISIBLE" | "DISCOVERED" | "UNDISCOVERED"
            position: {
                q: number,
                r: number,
                chunkQ: number,
                chunkR: number,
            },
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
            political: HiddenType<{
                control: ({
                    realm: number,
                    entity: number,
                    amount: number
                })[]
            }>
            createSettlement: {
                firstAvailable?: boolean,
                firstAllowed?: boolean,
                available?: boolean
                allowed?: boolean
            }
            meta: {
                seed: number,
            },
        })[],
        entities: ({
            id: number,
            owner: number | null,
            position: {
                q: number,
                r: number,
                chunkQ: number,
                chunkR: number,
            },
            components: (
                | { type: "player-spawn", radius: number, foundedFirstSettlement: boolean }
                | { type: "settlement", name: string, isRealmCapital: boolean }
                )[]
        })[]
    }
}