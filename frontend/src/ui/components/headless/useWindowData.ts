import {WindowStore} from "./windowStore";
import {useDraggable} from "../../../uiOLD/components/primitives/useDraggable";
import {MouseEvent} from "react";

export function useWindowStack() {
    const windowIds = WindowStore.useState(state => state.windows.map(w => w.id));
    return {
        windowIds: windowIds,
        stackId: "window-stack",
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


export function useWindow(id: string) {

    const [refDrag, onMouseDownDrag] = useDraggable(filterCanDrag, onDrag);
    const [refResize, onMouseDownResize] = useDraggable(filterCanResize, onResize);
    const modify = WindowStore.useState(state => state.modify);
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

    function onDrag(x: number, y: number, dx: number, dy: number) {
        modify(id, window => ({
            ...window,
            left: x,
            top: y,
        }));
    }

    function onResize(x: number, y: number, dx: number, dy: number) {
        modify(id, window => ({
            ...window,
            width: window.width + dx,
            height: window.height + dy,
        }));
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
    };
}


export function useOpenWindow() {
    return WindowStore.useState(state => state.add);
}


export function useCloseWindow() {
    return WindowStore.useState(state => state.remove);
}

