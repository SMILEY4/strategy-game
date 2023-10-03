import {UiFrameData, UiStore} from "../../_old_external/state/ui/uiStore";

export function useUiFrames(): UiFrameData[] {
    return UiStore.useState(state => state.frames);
}