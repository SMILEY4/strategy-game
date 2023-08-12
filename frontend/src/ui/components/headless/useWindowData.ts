import {WindowStore} from "./windowStore";
import {useDraggable} from "../../../uiOLD/components/primitives/useDraggable";
import {MouseEvent, useRef} from "react";

const FRAME_STACK_ID = "window-stack";

export function useWindowStack() {
    const windowIds = WindowStore.useState(state => state.windows.map(w => w.id));
    return {
        windowIds: windowIds,
        stackId: FRAME_STACK_ID,
    };
}

export function useWindowData(id: string) {

    const data = WindowStore.useState(state => state.windows).find(w => w.id === id);
    if (!data) {
        throw Error("Could not find window with id " + id);
    }

    return {
        elementProps: {
            style: {
                left: data.left ? data.left + "px" : undefined,
                top: data.top ? data.top + "px" : undefined,
                width: data.width ? data.width + "px" : undefined,
                height: data.height ? data.height + "px" : undefined,
            },
        },
        content: data.content,
        className: data.className,
    };
}

export interface UseWindowProps {
    minWidth: number,
    minHeight: number,
}

export function useWindow(id: string, props: UseWindowProps) {

    const refWindow = useRef<HTMLDivElement>(null);

    const [refDrag, onMouseDownDrag] = useDraggable(filterCanDrag, onDragPrepare, onDrag);
    const [refResize, onMouseDownResize] = useDraggable(filterCanResize, onResizePrepare, onResize);
    const modify = WindowStore.useState(state => state.modify);
    const close = useCloseWindow();
    const data = WindowStore.useState(state => state.windows.find(w => w.id === id));
    if (!data) {
        throw Error("Could not find window with id " + id);
    }

    function filterCanDrag(e: MouseEvent<any>): boolean {
        return e.button === 0;
    }

    function filterCanResize(e: MouseEvent<any>): boolean {
        return e.button === 0;
    }

    function onDragPrepare() {
    }

    function onDrag(x: number, y: number, dx: number, dy: number) {
        const areaSize = contentAreaSize()
        modify(id, window => ({
            ...window,
            left: Math.max(0, Math.min(x, areaSize.width-30)),
            top: Math.max(0, Math.min(y, areaSize.height-30)),
        }));
    }

    function onResizePrepare() {
        if(refWindow.current) {
            const currentWidth = refWindow.current.offsetWidth
            const currentHeight = refWindow.current.offsetHeight
            modify(id, window => ({
                ...window,
                width: currentWidth,
                height: currentHeight,
            }));
        }
    }

    function onResize(x: number, y: number, dx: number, dy: number) {
        modify(id, window => ({
            ...window,
            width: window.width + dx,
            height: window.height + dy,
        }));
    }

    function contentAreaSize(): { width: number, height: number } {
        const element = document.getElementById(FRAME_STACK_ID);
        if (element) {
            return {width: element.clientWidth, height: element.clientHeight};
        } else {
            console.warn("No frame-stack found for layout-calculation", FRAME_STACK_ID);
            return {width: 1, height: 1};
        }
    }

    return {
        resizerProps: {
            ref: refResize,
            onMouseDown: onMouseDownResize,
        },
        dragProps: {
            ref: refDrag,
            onMouseDown: onMouseDownDrag,
        },
        refWindow,
        closeWindow: () => close(id),
    };
}


export function useOpenWindow() {
    return WindowStore.useState(state => state.add);
}


export function useCloseWindow() {
    return WindowStore.useState(state => state.remove);
}

