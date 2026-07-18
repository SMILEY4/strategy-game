import {type WindowData, type WindowPosition, type WindowProperties, windowSystem} from "@modules/uicomponents/window/window-system.ts";
import {create} from "zustand";


interface WindowStoreState {
    windowData: WindowData[];
    windowIds: string[];
}

interface WindowStoreActions {
    add: (properties: WindowProperties) => void;
    remove: (id: string) => void;
    updatePosition: (id: string, action: (position: WindowPosition) => WindowPosition) => void;
    bringToFront: (id: string) => void;
}

export const useWindowStore = create<WindowStoreState & WindowStoreActions>()((set) => ({
    windowData: [],
    windowIds: [],

    add: (properties: WindowProperties) => set((state) => {
        const data = windowSystem.createInitialWindowData(properties, windowSystem.availableAnchors)
        const windowData = [...state.windowData.filter(it => it.groupId !== data.groupId), data]
        windowSystem.recalculateStackIndices(windowData)
        return {
            ...state,
            windowData: windowData,
            windowIds: windowData.map(it => it.windowId)
        }
    }),

    remove: (id: string) => set((state) => {
        const windowData = state.windowData.filter(it => it.windowId !== id)
        windowSystem.recalculateStackIndices(windowData)
        return {
            ...state,
            windowData: windowData,
            windowIds: windowData.map(it => it.windowId)
        }
    }),

    updatePosition: (id: string, updateFunc: (position: WindowPosition) => WindowPosition) => set((state) => {
        const windowData = state.windowData.map(window => {
            if(window.windowId === id) {
                return {...window, position: updateFunc(window.position)}
            } else {
                return window
            }
        })
        return {
            ...state,
            windowData: windowData,
        }
    }),

    bringToFront: (id: string) => set((state) => {
        const windowData = state.windowData.map(window => {
            if(window.windowId === id) {
                return {...window, stackIndex: 999999}
            } else {
                return window
            }
        })
        windowSystem.recalculateStackIndices(windowData)
        return {
            ...state,
            windowData: windowData,
            windowIds: windowData.map(it => it.windowId)
        }
    }),
}));
