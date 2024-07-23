import {WindowData, WindowStore} from "./windowStore";
import {MouseEvent, useRef} from "react";
import {useDraggable} from "./useDraggable";
import {joinClassNames} from "../utils";

const FRAME_STACK_ID = "window-stack";

export function useWindowStack() {
    const windowIds = WindowStore.useState(state => state.windows.map(w => w.id));
    return {
        windowIds: windowIds,
        stackId: FRAME_STACK_ID,
    };
}

export function useWindowData(id: string) {
    const dataWindows = WindowStore.useState(state => state.windows);
    const data = dataWindows.find(w => w.id === id);
    const isNotInteractable = dataWindows.some(w => w.id !== id && w.blockOthers === true)
    if (!data) {
        throw new Error("Could not find window with id " + id);
    }
    return {
        elementProps: {
            style: {
                left: data.left ? data.left + "px" : undefined,
                right: data.right ? data.right + "px" : undefined,
                top: data.top ? data.top + "px" : undefined,
                bottom: data.bottom ? data.bottom + "px" : undefined,
                width: data.width ? data.width + "px" : undefined,
                height: data.height ? data.height + "px" : undefined,
            },
        },
        content: data.content,
        className: joinClassNames([
            data.className,
            isNotInteractable ? "non-interactable": null,
        ]),
    };
}


export function useWindow(id: string) {

    const refWindow = useRef<HTMLDivElement>(null);

    const [refDrag, onMouseDownDrag] = useDraggable(filterCanDrag, onDragPrepare, onDrag);
    const [refResize, onMouseDownResize] = useDraggable(filterCanResize, onResizePrepare, onResize);

    const close = useCloseWindow();

    const modify = WindowStore.useState(state => state.modify);
    const data = WindowStore.useState(state => state.windows.find(w => w.id === id));

    if (!data) {
        throw new Error("Could not find window with id " + id);
    }

    function filterCanDrag(e: MouseEvent<any>): boolean {
        return e.button === 0;
    }

    function filterCanResize(e: MouseEvent<any>): boolean {
        return e.button === 0;
    }

    function onDragPrepare() {
        if (refWindow.current) {
            modify(id, window => {
                const bounds = windowBounds(id);
                return {
                    ...window,
                    width: bounds.width,
                    height: bounds.height,
                    top: bounds.top,
                    left: bounds.left,
                    bottom: null,
                    right: null,
                };
            });
        }
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
        if (refWindow.current) {
            modify(id, window => {
                const bounds = windowBounds(id);
                return {
                    ...window,
                    width: bounds.width,
                    height: bounds.height,
                    top: bounds.top,
                    left: bounds.left,
                    bottom: null,
                    right: null,
                };
            });
        }
    }

    function onResize(x: number, y: number, dx: number, dy: number) {
        modify(id, window => ({
            ...window,
            width: window.width!! + dx,
            height: window.height!! + dy,
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

    function isDirectPosition(data: WindowData) {
        return data.width !== undefined && data.width !== null
            && data.height !== undefined && data.height !== null
            && data.top !== undefined && data.top !== null
            && data.left !== undefined && data.left !== null
            && (data.bottom === undefined || data.bottom === null)
            && (data.right === undefined || data.right === null);
    }

    function windowBounds(windowId: string): { top: number, left: number, width: number, height: number } {
        const window = refWindow.current;
        if (window) {
            return {
                width: window.clientWidth,
                height: window.clientHeight,
                top: window.getBoundingClientRect().top,
                left: window.getBoundingClientRect().left,
            };
        } else {
            console.warn("Could not determine bounds for window", windowId, FRAME_STACK_ID);
            return {top: 1, left: 1, width: 1, height: 1};
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

export function openWindow(data: WindowData, keepPosition?: boolean) {
    return WindowStore.useState.getState().add(data, keepPosition)
}


export function useCloseWindow() {
    return WindowStore.useState(state => state.remove);
}

