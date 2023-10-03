import {generateId} from "../../../shared/utils";
import {UiFrameData} from "./uiStore";

export namespace UiFrames {

    export const FRAME_STACK_ID = "frame-stack";

    export interface FrameLayout {
        fixed?: FixedFrameLayout,
        centered?: CenteredFrameLayout,
        vertical?: VerticalFrameLayout
    }

    export interface FixedFrameLayout {
        x: number,
        y: number,
        width: number,
        height: number,
    }

    export interface CenteredFrameLayout {
        width: number,
        height: number,
    }

    export interface VerticalFrameLayout {
        x: number,
        width: number,
        top: number,
        bottom: number
    }


    /**
     * open a new frame with the given content and menu-id.
     * If a frame with the given menu-id is already open, replace its content with the given content
     */
    export function openFrame(
        menuId: string,
        layout: FrameLayout,
        content: (frameId: string) => any,
        frames: UiFrameData[],
        addFrame: (data: UiFrameData) => void,
        bringToFront: (frameId: string) => void,
        setContent: (frameId: string, content: any) => void,
    ): string {
        const frame = frames.find(e => e.menuId === menuId);
        if (frame) {
            setContent(frame.frameId, content(frame.frameId));
            bringToFront(frame.frameId);
            return frame.frameId;
        } else {
            const frameId = generateId();
            const positioning = calculateLayout(layout);
            addFrame({
                frameId: frameId,
                menuId: menuId,
                initX: positioning.x,
                initY: positioning.y,
                width: positioning.width,
                height: positioning.height,
                enablePin: true,
                content: content(frameId)
            });
            return frameId;
        }
    }

    function calculateLayout(layout: FrameLayout): { x: number, y: number, width: number, height: number } {
        if (layout.fixed) {
            return calculateLayoutFixed(layout.fixed);
        }
        if (layout.centered) {
            return calculateLayoutCentered(layout.centered);
        }
        if (layout.vertical) {
            return calculateLayoutVertical(layout.vertical);
        }
        console.warn("Unknown frame layout:", layout)
        return {
            x: 0,
            y: 0,
            width: 50,
            height: 50
        };
    }

    function calculateLayoutFixed(layout: FixedFrameLayout): { x: number, y: number, width: number, height: number } {
        return {...layout};
    }

    function calculateLayoutCentered(layout: CenteredFrameLayout): { x: number, y: number, width: number, height: number } {
        const areaSize = contentAreaSize();
        const paddingX = (areaSize.width - layout.width) / 2;
        const paddingY = (areaSize.height - layout.height) / 2;
        return {
            x: paddingX,
            y: paddingY,
            width: layout.width,
            height: layout.height
        };
    }

    function calculateLayoutVertical(layout: VerticalFrameLayout): { x: number, y: number, width: number, height: number } {
        const areaSize = contentAreaSize();
        const height = areaSize.height - (layout.top + layout.bottom);
        return {
            x: layout.x,
            y: layout.top,
            width: layout.width,
            height: height
        };
    }

    function contentAreaSize(): { width: number, height: number } {
        const element = document.getElementById(FRAME_STACK_ID);
        if (element) {
            return {width: element.clientWidth, height: element.clientHeight};
        } else {
            console.warn("No frame-stack found for layout-calculation", FRAME_STACK_ID)
            return {width: 1, height: 1};
        }
    }

}