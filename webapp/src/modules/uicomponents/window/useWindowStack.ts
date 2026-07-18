import {useWindowStore} from "@modules/uicomponents/window/window-store.ts";


interface UseWindowStackData {
    windowIds: string[];
}

export function useWindowStack(): UseWindowStackData {
    const windowIds = useWindowStore(state => state.windowIds);
    return {
        windowIds: windowIds,
    };
}