import {type MouseEvent, type RefObject, useRef, type WheelEvent} from "react";

export function toDrawingBufferCoordinates(
    x: number,
    y: number,
    rect: DOMRect,
    drawingBufferWidth: number,
    drawingBufferHeight: number,
): [number, number] {
    return [
        x * drawingBufferWidth / rect.width,
        y * drawingBufferHeight / rect.height,
    ];
}

/** Hook that translates DOM mouse events into structured callbacks for the canvas. */
export function useCanvasInteractions(options: {
    canvasRef: RefObject<HTMLCanvasElement | null>;
    onMouseMove?: (mx: number, my: number, x: number, y: number, buttons: number) => void
    onMouseScroll?: (scroll: number, x: number, y: number) => void
    onMouseClick?: (x: number, y: number) => void
}) {

    function getDrawingBufferSize(canvas: HTMLCanvasElement): [number, number] {
        const gl = canvas.getContext("webgl2");
        return gl
            ? [gl.drawingBufferWidth, gl.drawingBufferHeight]
            : [canvas.clientWidth, canvas.clientHeight];
    }

    function getCanvasCoordinates(e: MouseEvent | WheelEvent): {
        x: number,
        y: number,
        scaleX: number,
        scaleY: number,
    } {
        const canvas = options.canvasRef.current;
        const rect = canvas?.getBoundingClientRect() ?? e.currentTarget.getBoundingClientRect();
        const [drawingBufferWidth, drawingBufferHeight] = canvas
            ? getDrawingBufferSize(canvas)
            : [rect.width, rect.height];
        const scaleX = drawingBufferWidth / rect.width;
        const scaleY = drawingBufferHeight / rect.height;
        const [x, y] = toDrawingBufferCoordinates(
            e.clientX - rect.left,
            e.clientY - rect.top,
            rect,
            drawingBufferWidth,
            drawingBufferHeight,
        );
        return {x, y, scaleX, scaleY};
    }

    const refMouseDownInCanvas = useRef<boolean>(false);
    const refTimestampMouseDown = useRef<number>(0);

    function mouseMove(e: MouseEvent) {
        const {x, y, scaleX, scaleY} = getCanvasCoordinates(e);
        options.onMouseMove?.(
            e.movementX * scaleX,
            e.movementY * scaleY,
            x,
            y,
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
        const {x, y} = getCanvasCoordinates(e);
        options.onMouseScroll?.(e.deltaY, x, y);
    }

    function click(duration: number, e: MouseEvent) {
        if (duration < 150) {
            const {x, y} = getCanvasCoordinates(e);
            options.onMouseClick?.(x, y);
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
