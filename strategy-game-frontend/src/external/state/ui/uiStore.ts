import create, {SetState} from "zustand";

export interface DialogData {
    windowId: string,
    menuId: string,
    initX: number,
    initY: number,
    width: number,
    height: number,
    enablePin: boolean,
    content: any
}

export namespace UiStore {

    interface StateValues {
        dialogs: DialogData[];
    }

    const initialStateValues: StateValues = {
        dialogs: []
    };

    interface StateActions {
        addDialog: (data: DialogData) => void,
        removeDialog: (windowId: string) => void,
        setAllPositions: (x: number, y: number) => void,
        bringToFront: (windowId: string) => void
        setContent: (windowId: string, content: any) => void
        updateDialog: (windowId: string, mod: (prev: DialogData) => DialogData) => void
    }

    function stateActions(set: SetState<State>): StateActions {
        return {
            addDialog: (data: DialogData) => set((state: State) => ({
                dialogs: [...state.dialogs, data],
            })),
            removeDialog: (windowId: string) => set((state: State) => ({
                dialogs: state.dialogs.filter(e => e.windowId !== windowId),
            })),
            setAllPositions: (x: number, y: number) => set((state: State) => ({
                dialogs: state.dialogs.map(e => ({...e, initX: x, initY: y}))
            })),
            bringToFront: (windowId: string) => set((state: State) => ({
                dialogs: [
                    ...state.dialogs.filter(e => e.windowId !== windowId),
                    ...state.dialogs.filter(e => e.windowId === windowId)
                ]
            })),
            setContent: (windowId: string, content: any) => set((state: State) => ({
                dialogs: state.dialogs.map(e => {
                    if (e.windowId === windowId) {
                        return {
                            ...e,
                            content: content
                        };
                    } else {
                        return e;
                    }
                })
            })),
            updateDialog: (windowId: string, mod: (prev: DialogData) => DialogData) => set((state: State) => ({
                dialogs: state.dialogs.map(e => {
                    if (e.windowId === windowId) {
                        return mod(e);
                    } else {
                        return e;
                    }
                })
            })),
        };
    }

    export interface State extends StateValues, StateActions {
    }


    export const useState = create<State>((set: SetState<State>) => ({
        ...initialStateValues,
        ...stateActions(set)
    }));

}