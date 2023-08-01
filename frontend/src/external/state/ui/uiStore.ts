import create from "zustand";
import {SetState} from "../../../shared/zustandUtils";

export interface UiFrameData {
    frameId: string, // unique id of the
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
        frames: UiFrameData[];
    }

    const initialStateValues: StateValues = {
        frames: []
    };

    interface StateActions {
        addFrame: (data: UiFrameData) => void,
        removeFrame: (frameId: string) => void,
        setAllFramePositions: (x: number, y: number) => void,
        bringFrameToFront: (frameId: string) => void
        setFrameContent: (frameId: string, content: any) => void
        updateFrame: (frameId: string, mod: (prev: UiFrameData) => UiFrameData) => void
    }

    function stateActions(set: SetState<State>): StateActions {
        return {
            addFrame: (data: UiFrameData) => set((state: State) => ({
                frames: [...state.frames, data],
            })),
            removeFrame: (frameId: string) => set((state: State) => ({
                frames: state.frames.filter(e => e.frameId !== frameId),
            })),
            setAllFramePositions: (x: number, y: number) => set((state: State) => ({
                frames: state.frames.map(e => ({...e, initX: x, initY: y}))
            })),
            bringFrameToFront: (frameId: string) => set((state: State) => ({
                frames: [
                    ...state.frames.filter(e => e.frameId !== frameId),
                    ...state.frames.filter(e => e.frameId === frameId)
                ]
            })),
            setFrameContent: (frameId: string, content: any) => set((state: State) => ({
                frames: state.frames.map(e => {
                    if (e.frameId === frameId) {
                        return {
                            ...e,
                            content: content
                        };
                    } else {
                        return e;
                    }
                })
            })),
            updateFrame: (frameId: string, mod: (prev: UiFrameData) => UiFrameData) => set((state: State) => ({
                frames: state.frames.map(e => {
                    if (e.frameId === frameId) {
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


    export const useState = create<State>()((set) => ({
        ...initialStateValues,
        ...stateActions(set)
    }));

}