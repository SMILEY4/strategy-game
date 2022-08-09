import {UiStore} from "./uiStore";

export class UIStateAccess {

    public openFrame(menuId: string, x: number, y: number, width: number, height: number, content: any) {
        const dialogs = UiStore.useState.getState().frames;
        const addDialog = UiStore.useState.getState().addFrame;
        const bringToFront = UiStore.useState.getState().bringFrameToFront;
        const setContent = UiStore.useState.getState().setFrameContent;
        const dialog = dialogs.find(e => e.menuId === menuId);
        if (dialog) {
            setContent(dialog.frameId, content);
            bringToFront(dialog.frameId);
        } else {
            addDialog({
                frameId: crypto.randomUUID(),
                menuId: menuId,
                initX: x,
                initY: y,
                width: width,
                height: height,
                enablePin: true,
                content: content
            });
        }
    }

}
