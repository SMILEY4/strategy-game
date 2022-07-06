import {UiStore} from "../../external/state/ui/uiStore";

export function useDialogManager() {

    const dialogs = UiStore.useState(state => state.dialogs);
    const addDialog = UiStore.useState().addDialog;
    const removeDialog = UiStore.useState().removeDialog;
    const bringToFront = UiStore.useState().bringToFront;
    const setContent = UiStore.useState().setContent;
    const updateDialog = UiStore.useState().updateDialog;

    function pinDialog(windowId: string) {
        updateDialog(windowId, dialog => ({
            ...dialog,
            menuId: crypto.randomUUID(),
            enablePin: false
        }))
    }

    function open(menuId: string, x: number, y: number, width: number, height: number, content: any) {
        const dialog = dialogs.find(e => e.menuId === menuId);
        console.log("existing", dialog)
        if (dialog) {
            setContent(dialog.windowId, content);
            focus(dialog.windowId);
        } else {
            addDialog({
                windowId: crypto.randomUUID(),
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

    function close(id: string) {
        removeDialog(id);
    }

    function focus(id: string) {
        bringToFront(id);
    }

    return {
        open: open,
        close: close,
        focus: focus,
        pinDialog: pinDialog
    };
}