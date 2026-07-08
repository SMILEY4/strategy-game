import {type MouseEvent, useRef, type WheelEvent} from "react";

/** Hook that translates DOM mouse events into structured callbacks for the canvas. */
export function useCanvasInteractions(options: {
    onMouseMove?: (mx: number, my: number, x: number, y: number, buttons: number) => void
    onMouseScroll?: (scroll: number, x: number, y: number) => void
    onMouseClick?: (x: number, y: number) => void
}) {

    const refMouseDownInCanvas = useRef<boolean>(false);
    const refTimestampMouseDown = useRef<number>(0);

    function mouseMove(e: MouseEvent) {
        options.onMouseMove?.(
            e.movementX,
            e.movementY,
            e.clientX,
            e.clientY,
            e.buttons,
        );
    }

    function mouseDown(_: MouseEvent) {
        refMouseDownInCanvas.current = true;
        refTimestampMouseDown.current = Date.now();
    }

    function mouseUp(e: MouseEvent) {
        refMouseDownInCanvas.current = false;
        click(Date.now() - refTimestampMouseDown.current, e);
        refTimestampMouseDown.current = 0;
    }

    function mouseLeave(_: MouseEvent) {
        refMouseDownInCanvas.current = false;
    }

    function scroll(e: WheelEvent) {
        options.onMouseScroll?.(e.deltaY, e.deltaX, e.deltaY);
    }

    function click(duration: number, e: MouseEvent) {
        if (duration < 150) {
            const rect = e.currentTarget.getBoundingClientRect();
            options.onMouseClick?.(e.clientX - rect.left, e.clientY - rect.top);
        }
    }

    return {
        mouseMove: mouseMove,
        mouseUp: mouseUp,
        mouseDown: mouseDown,
        mouseLeave: mouseLeave,
        scroll: scroll,
        click: click,
    };
}