import {InteractionState} from "../../models/misc/interaction";
import {SetState} from "../../common/zustandUtils";
import create from "zustand";

export namespace InteractionStore {

    interface StateValues {
        currentState: InteractionState | null,
    }

    const initialStateValues: StateValues = {
        currentState: null
    };

    interface StateActions {
        set: (state: InteractionState | null) => void;
    }

    function stateActions(set: SetState<State>): StateActions {
        return {
            set: (state: InteractionState | null) => set(() => ({
                currentState: state,
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