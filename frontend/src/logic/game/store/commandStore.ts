import {SetState} from "../../../shared/zustandUtils";
import create from "zustand";
import {Command} from "../../../models/command";


export namespace CommandStore {

    interface StateValues {
        commands: Command[];
    }


    interface StateActions {
        set: (commands: Command[]) => void;
        add: (command: Command) => void;
    }


    const initialStateValues: StateValues = {
        commands: [],
    };


    function stateActions(set: SetState<State>): StateActions {
        return {
            set: (commands: Command[]) => set(() => ({
                commands: commands,
            })),
            add: (command: Command) => set(state => ({
                commands: [...state.commands, command],
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
