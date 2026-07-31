import {useWindowStore} from "@modules/uicomponents/window/window-store.ts";
import {useShallow} from "zustand/react/shallow";


interface UseWindowStackData {
    windowIds: string[];
}

export function useWindowStack(): UseWindowStackData {
    const windowIds = useWindowStore(
        useShallow(state => state.windowData.map(it => it.windowId)),
    );
    return {
        windowIds: windowIds,
    };
}