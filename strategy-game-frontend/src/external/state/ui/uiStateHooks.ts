import {UiFrames} from "./uiFrames";
import {UiStore} from "./uiStore";

export namespace UiStateHooks {

    import FrameLayout = UiFrames.FrameLayout;

    /**
     * open a new frame with the given content and menu-id.
     * If a frame with the given menu-id is already open, replace its content with the given content
     */
    export function useOpenFrame() {
        const frames = UiStore.useState(state => state.frames);
        const addFrame = UiStore.useState().addFrame;
        const bringToFront = UiStore.useState().bringFrameToFront;
        const setContent = UiStore.useState().setFrameContent;
        return (menuId: string, layout: FrameLayout, content: (frameId: string) => any): string => {
            return UiFrames.openFrame(
                menuId,
                layout,
                content,
                frames,
                addFrame,
                bringToFront,
                setContent
            );
        };
    }

    export function useOpenPrimaryMenuDialog(content: any) {
        const open = useOpenFrame();
        return () => {
            open(
                "topbar.category.menu",
                {
                    vertical: {
                        x: 10,
                        width: 320,
                        top: 50,
                        bottom: 10
                    }
                },
                () => content);
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
            update(frameId, frame => ({
                ...frame,
                menuId: crypto.randomUUID(),
                enablePin: false
            }));
        };
    }

    export function useFrames() {
        return UiStore.useState(state => state.frames);
    }

}
