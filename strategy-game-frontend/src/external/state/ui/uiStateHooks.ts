import {UiStore} from "./uiStore";

export namespace UiStateHooks {

    export function useOpenPrimaryMenuDialog(content: any) {
        const open = UiStore.useOpenDialog();
        return () => {
            open("topbar.category.menu", 10, 50, 320, 650, content);
        };
    }

    export function useRepositionDialogs() {
        const setDialogPositions = UiStore.useState().setAllPositions;
        return () => {
            setDialogPositions(300, 300)
        }
    }

    export function useCloseDialog(windowId: string) {
        const removeDialog = UiStore.useState().removeDialog;
        return () => {
            removeDialog(windowId);
        }
    }

    export function usePinDialog(windowId: string) {
        const updateDialog = UiStore.useState().updateDialog;
        return () => {
            updateDialog(windowId, dialog => ({
                ...dialog,
                menuId: crypto.randomUUID(),
                enablePin: false
            }))
        }
    }

    export function useDialogs() {
        return UiStore.useState(state => state.dialogs);
    }

}
