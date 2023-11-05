import {SetState} from "../../shared/zustandUtils";
import create from "zustand";
import {INITIAL_REMOTE_GAME_STATE, RemoteGameState} from "./RemoteGameState";

export namespace RemoteGameStateStore {

    interface StateValues extends RemoteGameState {
    }

    const initialStateValues: StateValues = INITIAL_REMOTE_GAME_STATE;

    interface StateActions {
        set: (state: RemoteGameState) => void;
    }

    function stateActions(set: SetState<State>): StateActions {
        return {
            set: (state: RemoteGameState) => set(() => state),
        };
    }

    export interface State extends StateValues, StateActions {
    }

    export const useState = create<State>()((set) => ({
        ...initialStateValues,
        ...stateActions(set),
    }));

}
