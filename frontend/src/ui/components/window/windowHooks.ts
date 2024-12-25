import {WindowStore} from "./windowStore";
import {WindowProperties} from "./windowProperties";
import {CssValue} from "./cssValue";
import {useDraggable} from "../headless/useDraggable";
import {MouseEvent, useRef} from "react";


const WINDOW_STACK_ID = "window-stack"

export function useOpenWindow(): (properties: WindowProperties) => void {
    const add = WindowStore.useState(state => state.add);
    return (properties: WindowProperties) => {
        add(properties);
    };
}

export function openWindow(properties: WindowProperties) {
    WindowStore.useState.getState().add(properties);
}

export function useCloseWindow(): (windowId: string) => void {
    const remove = WindowStore.useState(state => state.remove);
    return (windowId) => {
        remove(windowId)
    }
}

export function useIsBlockingWindowOpen(): boolean {
    return WindowStore
        .useState(state => state.windows.map(it => it.blockOthers))
        .some(it => it)
}

export function useWindowStack(): string[] {
    return WindowStore.useState(state => state.windows.map(it => it.id));
}

export function useWindowData(id: string) {
    const data = WindowStore.useState(state => state.windows.find(it => it.id === id));
    const blockingWindows = WindowStore.useState(state => state.windows.filter(it => it.blockOthers).map(it => it.id));
    if (!data) {
        throw new Error("Could not find window with id " + id);
    }
    return {
        elementProps: {
            style: {
                left: CssValue.format(data.position.left),
                right: CssValue.format(data.position.right),
                top: CssValue.format(data.position.top),
                bottom: CssValue.format(data.position.bottom),
                width: CssValue.format(data.position.width),
                height: CssValue.format(data.position.height),
                margin: data.position.autoMargin ? "auto" : undefined,
            },
        },
        isBlocked: blockingWindows.length > 0 && blockingWindows.indexOf(id) === -1,
        content: data.content,
    };
}

export function useWindowInteractions(id: string) {

    const data = WindowStore.useState(state => state.windows.find(it => it.id === id));
    if (!data) {
        throw new Error("Could not find window with id " + id);
    }

    const modifyPosition = WindowStore.useState(state => state.modifyPosition);

    const close = useCloseWindow()
    const refContent = useRef<HTMLDivElement>(null);
    const [refDrag, onMouseDownDrag] = useDraggable(filterCanDrag, onPrepare, onDrag);
    const [refResize, onMouseDownResize] = useDraggable(filterCanResize, onPrepare, onResize);

    function filterCanDrag(e: MouseEvent<any>): boolean {
        return e.button === 0;
    }

    function filterCanResize(e: MouseEvent<any>): boolean {
        return e.button === 0;
    }

    function onPrepare() {
        if (refContent.current) {
            const bounds = getAbsoluteBounds();
            modifyPosition(id, _ => ({
                top: CssValue.px(bounds.top),
                left: CssValue.px(bounds.left),
                width: CssValue.px(bounds.width),
                height: CssValue.px(bounds.height),
                bottom: null,
                right: null,
                autoMargin: false,
            }));
        }
    }

    function onDrag(x: number, y: number, dx: number, dy: number) {
        const availableArea = getAvailableArea();
        modifyPosition(id, prevPosition => ({
            left: CssValue.px(Math.max(0, Math.min(x, availableArea.width-30))),
            top: CssValue.px(Math.max(0, Math.min(y, availableArea.height-30))),
            width: prevPosition.width,
            height: prevPosition.height,
            bottom: null,
            right: null,
            autoMargin: false,
        }));
    }

    function onResize(x: number, y: number, dx: number, dy: number) {
        modifyPosition(id, prevPosition => ({
            top: prevPosition.top,
            left: prevPosition.left,
            width: CssValue.px(prevPosition.width?.value!! + dx),
            height: CssValue.px(prevPosition.height?.value!! + dy),
            bottom: null,
            right: null,
            autoMargin: false,
        }));
    }

    function getAbsoluteBounds(): { top: number, left: number, width: number, height: number } {
        const element = refContent.current;
        if (element == null) {
            console.warn("Could not determine bounds for window.");
            return {top: 1, left: 1, width: 1, height: 1};
        }
        return {
            top: element.getBoundingClientRect().top,
            left: element.getBoundingClientRect().left,
            width: element.clientWidth,
            height: element.clientHeight,
        };
    }

    function getAvailableArea(): { width: number, height: number } {
        const element = document.getElementById(WINDOW_STACK_ID);
        if (element) {
            return {width: element.clientWidth, height: element.clientHeight};
        } else {
            console.warn("No frame-stack found for layout-calculation", WINDOW_STACK_ID);
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
        closeWindow: () => close(id),
        refContent,
    };
}