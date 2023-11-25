import {SetState} from "../../shared/zustandUtils";
import create from "zustand";
import {INITIAL_REMOTE_GAME_STATE, RemoteGameState} from "./RemoteGameState";
import {UID} from "../../shared/uid";

export namespace RemoteGameStateStore {

    interface StateValues {
        gameState: RemoteGameState,
        revId: string
    }

    const initialStateValues: StateValues = {
        gameState: INITIAL_REMOTE_GAME_STATE,
        revId: ""
    };

    interface StateActions {
        set: (state: RemoteGameState) => void;
    }

    function stateActions(set: SetState<State>): StateActions {
        return {
            set: (state: RemoteGameState) => set(() => ({
                gameState: state,
                revId: UID.generate()
            })),
        };
    }

    export interface State extends StateValues, StateActions {
    }

    export const useState = create<State>()((set) => ({
        ...initialStateValues,
        ...stateActions(set),
    }));

}
