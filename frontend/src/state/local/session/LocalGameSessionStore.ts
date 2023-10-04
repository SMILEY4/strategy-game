import {SetState} from "../../../shared/zustandUtils";
import create from "zustand";
import {GameConfig} from "../../../models/gameConfig";

export namespace LocalGameSessionStore {

    interface StateValues {
        state: "none" | "loading" | "playing" | "error",
        config: GameConfig | null
    }

    const initialStateValues: StateValues = {
        state: "none",
        config: null,
    };

    interface StateActions {
        setState: (state: "none" | "loading" | "playing" | "error") => void;
        setConfig: (config: GameConfig | null) => void;
    }

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
