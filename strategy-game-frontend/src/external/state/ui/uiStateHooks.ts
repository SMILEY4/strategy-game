import {UiStore} from "./uiStore";

export namespace UiStateHooks {

    /**
     * open a new frame with the given content and menu-id.
     * If a frame with the given menu-id is already open, replace its content with the given content
     */
    export function useOpenFrame() {
        const frames = UiStore.useState(state => state.frames);
        const addFrame = UiStore.useState().addFrame;
        const bringToFront = UiStore.useState().bringFrameToFront;
        const setContent = UiStore.useState().setFrameContent;
        return (menuId: string, x: number, y: number, width: number, height: number, content: any) => {
            const frame = frames.find(e => e.menuId === menuId);
            if (frame) {
                setContent(frame.frameId, content);
                bringToFront(frame.frameId);
            } else {
                addFrame({
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
        };
    }

    export function useOpenPrimaryMenuDialog(content: any) {
        const open = useOpenFrame();
        return () => {
            open("topbar.category.menu", 10, 50, 320, 650, content);
        };
    }

    export function useRepositionFrames() {
        const setPositions = UiStore.useState().setAllFramePositions;
        return () => {
            setPositions(300, 300);
        };
    }

    export function useCloseFrame(frameId: string) {
        const remove = UiStore.useState().removeFrame;
        return () => {
            remove(frameId);
        };
    }

    export function usePinFrame(frameId: string) {
        const update = UiStore.useState().updateFrame;
        return () => {
            update(frameId, dialog => ({
                ...dialog,
                menuId: crypto.randomUUID(),
                enablePin: false
            }));
        };
    }

    export function useFrames() {
        return UiStore.useState(state => state.frames);
    }

}
