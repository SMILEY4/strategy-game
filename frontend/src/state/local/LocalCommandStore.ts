import {SetState} from "../../shared/zustandUtils";
import create from "zustand";
import {UID} from "../../shared/uid";
import {Command} from "../../models/command";

export namespace LocalCommandStateStore {

    interface StateValues {
        revId: string,
        commands: Command[];
    }

    const initialStateValues: StateValues = {
        revId: UID.generate(),
        commands: [],
    };

    interface StateActions {
        set: (commands: Command[]) => void;
    }

    function stateActions(set: SetState<State>): StateActions {
        return {
            set: (commands: Command[]) => set(() => ({
                revId: UID.generate(),
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
