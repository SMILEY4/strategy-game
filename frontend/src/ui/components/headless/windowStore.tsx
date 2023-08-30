import create from "zustand";
import {SetState} from "../../../shared/zustandUtils";

export interface WindowData {
    id: string,
    className?: string,
    left?: number | null,
    right?: number | null,
    top?: number | null,
    bottom?: number | null,
    width?: number | null,
    height?: number | null,
    content: any,
}

export namespace WindowStore {

    interface StateValues {
        windows: WindowData[];
    }

    const initialStateValues: StateValues = {
        windows: [],
    };

    interface StateActions {
        add: (data: WindowData, keepPosition?: boolean) => void,
        remove: (id: string) => void,
        modify: (id: string, modification: (data: WindowData) => WindowData) => void
    }

    function stateActions(set: SetState<State>): StateActions {
        return {
            add: (data: WindowData, keepPosition?: boolean) => set((state: State) => {
                if (keepPosition === true && state.windows.find(w => w.id === data.id)) {
                    return {
                        windows: state.windows.map(window => {
                            if (window.id === data.id) {
                                return {
                                    ...data,
                                    left: window.left,
                                    right: window.right,
                                    top: window.top,
                                    bottom: window.bottom,
                                    width: window.width,
                                    height: window.height,
                                };
                            } else {
                                return window;
                            }
                        }),
                    };
                } else {
                    return {
                        windows: [...state.windows.filter(w => w.id !== data.id), data],
                    };
                }
            }),
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