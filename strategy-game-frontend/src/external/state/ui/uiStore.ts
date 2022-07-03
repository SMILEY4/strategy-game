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
        dialogs: [
            {
                id: "test-1",
                initX: 100,
                initY: 100,
                width: 400,
                height: 200,
                content: "Hello Content 1"
            },
            {
                id: "test-2",
                initX: 500,
                initY: 200,
                width: 300,
                height: 300,
                content: "Hello Content 2"
            }
        ]
    };

    interface StateActions {
        addDialog: (data: DialogData) => void,
        removeDialog: (id: string) => void,
        setAllPositions: (x: number, y: number) => void,
        bringToFront: (id: string) => void
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
        };
    }

    export interface State extends StateValues, StateActions {
    }


    export const useState = create<State>((set: SetState<State>) => ({
        ...initialStateValues,
        ...stateActions(set)
    }));

}