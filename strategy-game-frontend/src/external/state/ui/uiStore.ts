import create, {SetState} from "zustand";

export interface DialogData {
    id: string,
    initX: number,
    initY: number,
    width: number,
    height: number,
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
        removeDialog: (id: string) => void,
        setAllPositions: (x: number, y: number) => void,
        bringToFront: (id: string) => void
        setContent: (id: string, content: any) => void
        changeId: (prevId: string, newId: string) => void
    }

    function stateActions(set: SetState<State>): StateActions {
        return {
            addDialog: (data: DialogData) => set((state: State) => ({
                dialogs: [...state.dialogs, data],
            })),
            removeDialog: (id: string) => set((state: State) => ({
                dialogs: state.dialogs.filter(e => e.id !== id),
            })),
            setAllPositions: (x: number, y: number) => set((state: State) => ({
                dialogs: state.dialogs.map(e => ({...e, initX: x, initY: y}))
            })),
            bringToFront: (id: string) => set((state: State) => ({
                dialogs: [
                    ...state.dialogs.filter(e => e.id !== id),
                    ...state.dialogs.filter(e => e.id === id)
                ]
            })),
            setContent: (id: string, content: any) => set((state: State) => ({
                dialogs: state.dialogs.map(e => {
                    if (e.id === id) {
                        return {
                            ...e,
                            content: content
                        };
                    } else {
                        return e;
                    }
                })
            })),
            changeId: (prevId: string, newId: string) => set((state: State) => ({
                dialogs: state.dialogs.map(e => {
                    if (e.id === prevId) {
                        return {
                            ...e,
                            id: newId
                        };
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