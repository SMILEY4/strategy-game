import {SetState} from "../../../shared/zustandUtils";
import create from "zustand";
import {Command} from "../../../models/command";

export namespace LocalCommandStateStore {

    interface StateValues {
        commands: Command[];
    }

    const initialStateValues: StateValues = {
        commands: [],
    };

    interface StateActions {
        set: (commands: Command[]) => void;
    }

    function stateActions(set: SetState<State>): StateActions {
        return {
            set: (commands: Command[]) => set(() => ({
                commands: commands,
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
