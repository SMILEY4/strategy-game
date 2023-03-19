import {MsgGameState} from "./msgGameState";

export interface PayloadInitTurnState {
    game: MsgGameState
    errors: ({
        errorMessage: string,
    })[]
}