import {UiStore} from "../../external/state/ui/uiStore";

export function useDialogManager() {

    const dialogs = UiStore.useState(state => state.dialogs);
    const addDialog = UiStore.useState().addDialog;
    const removeDialog = UiStore.useState().removeDialog;
    const bringToFront = UiStore.useState().bringToFront;
    const setContent = UiStore.useState().setContent;
    const changeId = UiStore.useState().changeId;

    function pinDialog(id: string) {
        changeId(id, crypto.randomUUID());
    }

    function open(id: string, x: number, y: number, width: number, height: number, content: any) {
        const exists = dialogs.findIndex(e => e.id === id) !== -1;
        if (exists) {
            setContent(id, content);
            focus(id);
        } else {
            addDialog({
                id: id,
                initX: x,
                initY: y,
                width: width,
                height: height,
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