import create from "zustand";
import {SetState} from "../../../shared/zustandUtils";
import {TestWindow} from "../windows/TestWindow";
import {DecoratedWindow} from "../windows/decorated/DecoratedWindow";

export interface WindowData {
    id: string,
    className?: string,
    left: number,
    top: number,
    width: number,
    height: number,
    content: any,
}

export namespace WindowStore {

    interface StateValues {
        windows: WindowData[];
    }

    const initialStateValues: StateValues = {
        windows: [
            {
                id: "test-1",
                left: 100,
                top: 100,
                width: 200,
                height: 100,
                content: <DecoratedWindow windowId={"test-1"}/>,
            },
        ],
    };

    interface StateActions {
        add: (data: WindowData) => void,
        remove: (id: string) => void,
        modify: (id: string, modification: (data: WindowData) => WindowData) => void
    }

    function stateActions(set: SetState<State>): StateActions {
        return {
            add: (data: WindowData) => set((state: State) => ({
                windows: [...state.windows, data],
            })),
            remove: (id: string) => set((state: State) => ({
                windows: state.windows.filter(e => e.id !== id),
            })),
            modify: (id: string, modification: (data: WindowData) => WindowData) => set((state: State) => ({
                windows: state.windows.map(window => {
                    if (window.id === id) {
                        return modification(window);
                    } else {
                        return window;
                    }
                }),
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