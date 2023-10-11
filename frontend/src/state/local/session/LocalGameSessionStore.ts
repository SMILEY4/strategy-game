import {SetState} from "../../../shared/zustandUtils";
import create from "zustand";
import {GameConfig} from "../../../models/gameConfig";

export namespace LocalGameSessionStore {

    interface StateValues {
        state: "none" | "loading" | "playing" | "error",
        turnState: "playing" | "waiting"
        config: GameConfig | null
    }

    const initialStateValues: StateValues = {
        state: "none",
        turnState: "playing",
        config: null,
    };

    interface StateActions {
        setState: (state: "none" | "loading" | "playing" | "error") => void;
        setTurnState: (state: "playing" | "waiting") => void;
        setConfig: (config: GameConfig | null) => void;
    }

    function stateActions(set: SetState<State>): StateActions {
        return {
            setState: (state: "none" | "loading" | "playing" | "error") => set(() => ({
                state: state,
            })),
            setTurnState: (state: "playing" | "waiting") => set(() => ({
                turnState: state,
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
