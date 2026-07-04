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
            }
        })[]
    }
}