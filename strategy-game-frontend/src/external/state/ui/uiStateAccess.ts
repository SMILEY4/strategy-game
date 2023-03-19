import {UiFrames} from "./uiFrames";
import {UiStore} from "./uiStore";
import FrameLayout = UiFrames.FrameLayout;

export class UIStateAccess {

    public openFrame(menuId: string, layout: FrameLayout, content: (frameId: string) => any) {
        const frames = UiStore.useState.getState().frames;
        const addFrame = UiStore.useState.getState().addFrame;
        const bringToFront = UiStore.useState.getState().bringFrameToFront;
        const setContent = UiStore.useState.getState().setFrameContent;
        UiFrames.openFrame(
            menuId,
            layout,
            content,
            frames,
            addFrame,
            bringToFront,
            setContent
        );
    }

}
