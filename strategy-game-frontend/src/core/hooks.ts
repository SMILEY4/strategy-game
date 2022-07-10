import {GameStore} from "../external/state/game/gameStore";
import {UiStore} from "../external/state/ui/uiStore";
import {UserStore} from "../external/state/user/userStore";

export namespace Hooks {

    export function useIsAuthenticated(): boolean {
        return !!UserStore.useState(state => state.idToken);
    }

    export function useCurrentGameState(): "idle" | "loading" | "active" {
        return GameStore.useState(state => state.currentState);
    }

    export function useTurnState(): "active" | "submitted" {
        return GameStore.useState(state => state.turnState);
    }

    export function useSelectedTile(): null | [number, number] {
        return GameStore.useState(state => state.tileSelected);
    }

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