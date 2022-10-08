import {UIService} from "../../../core/required/UIService";
import {MenuSelectedTile} from "../../../ui/pages/game/ui/MenuSelectedTile";
import {UiFrames} from "./uiFrames";
import {UiStore} from "./uiStore";
import FrameLayout = UiFrames.FrameLayout;

export class UIServiceImpl implements UIService {

    openMenuSelectedTile(): void {
        this.openFrame(
            "topbar.category.menu",
            {
                vertical: {
                    x: 10,
                    width: 320,
                    top: 50,
                    bottom: 10
                }
            },
            () => <MenuSelectedTile/>
        );
    }

    private openFrame(menuId: string, layout: FrameLayout, content: (frameId: string) => any) {
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