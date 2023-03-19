import {UiFrameData, UiStore} from "../../external/state/ui/uiStore";

export function useUiFrames(): UiFrameData[] {
    return UiStore.useState(state => state.frames);
}