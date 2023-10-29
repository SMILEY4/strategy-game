import {LocalGameSessionStore} from "../local/LocalGameSessionStore";
import {GameSessionState} from "../../models/gameSessionState";
import {GameTurnState} from "../../models/gameTurnState";

export class GameSessionStateRepository {

    public setGameSessionState(state: GameSessionState) {
        LocalGameSessionStore.useState.getState().setState(state);
    }

    public getGameSessionState(): GameSessionState {
        return LocalGameSessionStore.useState.getState().state;
    }

    public setGameTurnState(state: GameTurnState) {
        LocalGameSessionStore.useState.getState().setTurnState(state);
    }

}

export namespace GameSessionStateRepository {

    export function useGameSessionState(): GameSessionState {
        return LocalGameSessionStore.useState(state => state.state);
    }

    export function useGameTurnState(): GameTurnState {
        return LocalGameSessionStore.useState(state => state.turnState);
    }

    export function useSetGameTurnState(): (state: GameTurnState) => void {
        return LocalGameSessionStore.useState().setTurnState;
    }

}