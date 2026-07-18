import {WINDOW_STACK_ID, type WindowProperties} from "@modules/uicomponents/window/window-system.ts";
import {useWindowStore} from "@modules/uicomponents/window/window-store.ts";
import {useDraggable} from "@modules/uicomponents/hooks/useDraggable.ts";
import {type MouseEvent, useRef} from "react";
import {type CssValue, CssValueUtils} from "@modules/utilities/css-value.ts";

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

export function useWindowInteractions(id: string) {

    const data = useWindowStore(state => state.windowData.find(it => it.windowId === id));

    const modifyPosition = useWindowStore(state => state.updatePosition);
    const bringToFront = useWindowStore(state => state.bringToFront);

    const close = useCloseWindow();
    const refContent = useRef<HTMLDivElement>(null);
    const [refDrag, onMouseDownDrag] = useDraggable(filterCanDrag, onPrepare, onDrag);
    const [refResize, onMouseDownResize] = useDraggable(filterCanResize, onPrepare, onResize);

    if (!data) {
        throw new Error("Could not find window with id " + id);
    }

    function filterCanDrag(e: MouseEvent<any>): boolean {
        return e.button === 0;
    }

    function filterCanResize(e: MouseEvent<any>): boolean {
        return e.button === 0;
    }

    function onPrepare() {
        if (refContent.current) {
            bringToFront(id);
            normalizePositioning(refContent.current)
        }
    }

    function normalizePositioning(contentElement: HTMLElement) {

        const stackBounds = document.getElementById(WINDOW_STACK_ID)!.getBoundingClientRect();
        const windowBounds = contentElement.getBoundingClientRect();

        function toPixels(value: CssValue | undefined | null, parentSize: number): number | null {
            if(!value) return null
            if(value.unit === "px") return value.value
            if(value.unit === "%") return (value.value / 100) * parentSize
            return null;
        }
        let left = toPixels(data?.position.left, stackBounds.width);
        let top = toPixels(data?.position.top, stackBounds.height);

        if(data?.position.transform) {
            const translateRegex = /translate\(\s*(-?\d+(?:\.\d+)?)(px|\%)?\s*,\s*(-?\d+(?:\.\d+)?)(px|\%)?\s*\)/;
            const match = data?.position.transform.match(translateRegex);
            if (match) {
                const valX = parseFloat(match[1]);
                const unitX = match[2];

                const valY = parseFloat(match[3]);
                const unitY = match[4];

                const translateXPixels = unitX === '%' ? windowBounds.width * (valX / 100) : valX;
                const translateYPixels = unitY === '%' ? windowBounds.height * (valY / 100) : valY;

                left += translateXPixels;
                top += translateYPixels;
            }
        }

        modifyPosition(id, _ => ({
            top: CssValueUtils.px(top),
            left: CssValueUtils.px(left),
            width: CssValueUtils.px(windowBounds.width),
            height: CssValueUtils.px(windowBounds.height),
            bottom: null,
            right: null,
            transform: null,
        }));
    }

    function onDrag(x: number, y: number, _dx: number, _dy: number) {
        const availableArea = getAvailableArea();
        const windowBounds = refContent.current?.getBoundingClientRect()!;
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

    function getAvailableArea(): { top: number, left: number, width: number, height: number } {
        const element = document.getElementById(WINDOW_STACK_ID);
        if (element) {
            return {
                top: element.getBoundingClientRect().top,
                left: element.getBoundingClientRect().left,
                width: element.clientWidth,
                height: element.clientHeight
            };
        } else {
            console.warn("No frame-stack found for layout-calculation", WINDOW_STACK_ID);
            return {top: 0, left: 0, width: 1, height: 1};
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
        refContent: refContent,
        closeWindow: () => close(id),
    };
}