import create from "zustand";
import {GameConfig} from "../../core/models/gameConfig";
import {SetState} from "../../shared/zustandUtils";


export namespace GameSessionStore {

    interface StateValues {
        state: "none" | "loading" | "playing" | "error",
        config: GameConfig | null
    }


    interface StateActions {
        setState: (state: "none" | "loading" | "playing" | "error") => void;
        setConfig: (config: GameConfig | null) => void;
    }


    const initialStateValues: StateValues = {
        state: "none",
        config: null,
    };


    function stateActions(set: SetState<State>): StateActions {
        return {
            setState: (state: "none" | "loading" | "playing" | "error") => set(() => ({
                state: state,
            })),
            setConfig: (config: GameConfig | null) => set(() => ({
                config: config,
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
