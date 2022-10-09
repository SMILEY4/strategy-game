import create from "zustand";
import {GameConfig} from "../../../models/state/gameConfig";
import {SetState} from "../../../shared/zustandUtils";

export namespace GameConfigStore {

    interface StateValues {
        config: GameConfig;
    }

    const initialStateValues: StateValues = {
        config: null as any
    };

    interface StateActions {
        setConfig: (config: GameConfig) => void;
    }

    function stateActions(set: SetState<State>): StateActions {
        return {
            setConfig: (config: GameConfig) => set(() => ({
                config: config,
            })),
        };
    }

    export interface State extends StateValues, StateActions {
    }


    export const useState = create<State>()((set) => ({
        ...initialStateValues,
        ...stateActions(set)
    }));

}