import {SetState} from "../../shared/zustandUtils";
import create from "zustand";
import {GameConfig} from "../../models/gameConfig";
import {GameSessionState} from "../../models/gameSessionState";
import {GameTurnState} from "../../models/gameTurnState";

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
        setState: (state: GameSessionState) => void;
        setTurnState: (state: GameTurnState) => void;
        setConfig: (config: GameConfig | null) => void;
    }

    function stateActions(set: SetState<State>): StateActions {
        return {
            setState: (state: GameSessionState) => set(() => ({
                state: state,
            })),
            setTurnState: (state: GameTurnState) => set(() => ({
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
