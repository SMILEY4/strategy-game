import {WINDOW_STACK_ID, type WindowProperties} from "@modules/uicomponents/window/window-system.ts";
import {useWindowStore} from "@modules/uicomponents/window/window-store.ts";
import {useDraggable} from "@modules/uicomponents/hooks/useDraggable.ts";
import {useCallback, useRef} from "react";
import {CssValueUtils} from "@modules/utilities/css-value.ts";

export function useOpenWindow(): (properties: WindowProperties) => void {
    const add = useWindowStore(state => state.add);
    return (properties: WindowProperties) => {
        add(properties);
    };
}

export function openWindow(properties: WindowProperties) {
    useWindowStore.getState().add(properties);
}

export function useCloseWindow(): (windowId: string) => void {
    const remove = useWindowStore(state => state.remove);
    return (windowId) => {
        remove(windowId);
    };
}

export function closeWindow(windowId: string): void {
    useWindowStore.getState().remove(windowId);
}

export function useBringWindowToFront(): (windowId: string) => void {
    const bringToFront = useWindowStore(state => state.bringToFront);
    return (windowId) => {
        bringToFront(windowId);
    };
}

export function bringWindowToFront(windowId: string): void {
    useWindowStore.getState().bringToFront(windowId);
}

function filterCanInteract(e: MouseEvent): boolean {
    return e.button === 0;
}

export function useWindowInteractions(id: string) {

    const data = useWindowStore(state => state.windowData.find(it => it.windowId === id));

    const modifyPosition = useWindowStore(state => state.updatePosition);
    const bringToFront = useWindowStore(state => state.bringToFront);

    const close = useCloseWindow();
    const refContent = useRef<HTMLDivElement>(null);
    const [refDrag, onMouseDownDrag] = useDraggable(filterCanInteract, onPrepareDragOrResize, onDrag);
    const [refResize, onMouseDownResize] = useDraggable(filterCanInteract, onPrepareDragOrResize, onResize);

    if (!data) {
        throw new Error("Could not find window with id " + id);
    }

    function onPrepareDragOrResize() {
        if (refContent.current) {
            bringToFront(id);
            normalizePositioning(refContent.current);
        }
    }

    function normalizePositioning(contentElement: HTMLElement) {
        const stackElement = document.getElementById(WINDOW_STACK_ID);
        if (!stackElement) {
            throw new Error("Could not find window stack element");
        }
        const stackBounds = stackElement.getBoundingClientRect();
        const windowBounds = contentElement.getBoundingClientRect();

        modifyPosition(id, _ => ({
            top: CssValueUtils.px(windowBounds.top - stackBounds.top),
            left: CssValueUtils.px(windowBounds.left - stackBounds.left),
            width: CssValueUtils.px(windowBounds.width),
            height: CssValueUtils.px(windowBounds.height),
            bottom: null,
            right: null,
            transform: null,
        }));
    }

    function onDrag(x: number, y: number, _dx: number, _dy: number) {
        const availableArea = getAvailableArea();
        const windowBounds = refContent.current?.getBoundingClientRect() ?? {width: 0, height: 0};
        modifyPosition(id, prevPosition => ({
            ...prevPosition,
            left: CssValueUtils.px(Math.max(0, Math.min(x - availableArea.left, availableArea.width - windowBounds.width))),
            top: CssValueUtils.px(Math.max(0, Math.min(y - availableArea.top, availableArea.height - windowBounds.height))),
        }));
    }

    function onResize(_x: number, _y: number, dx: number, dy: number) {
        modifyPosition(id, prevPosition => ({
            ...prevPosition,
            width: CssValueUtils.px((prevPosition.width?.value as number) + dx),
            height: CssValueUtils.px((prevPosition.height?.value as number) + dy),
        }));
    }

    function getAvailableArea(): { top: number; left: number; width: number; height: number } {
        const element = document.getElementById(WINDOW_STACK_ID);
        if (!element) {
            console.warn("No frame-stack found for layout-calculation", WINDOW_STACK_ID);
            return {top: 0, left: 0, width: 1, height: 1};
        }
        const rect = element.getBoundingClientRect();
        return {
            top: rect.top,
            left: rect.left,
            width: element.clientWidth,
            height: element.clientHeight,
        };
    }

    const handleClose = useCallback(() => close(id), [close, id]);

    return {
        resizerProps: {
            ref: refResize,
            onMouseDown: onMouseDownResize,
        },
        dragProps: {
            ref: refDrag,
            onMouseDown: onMouseDownDrag,
        },
        refContent: refContent,
        closeWindow: handleClose,
    };
}