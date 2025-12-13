import {MouseEvent, useRef, WheelEvent} from "react";
import {GameService} from "../../../../app/game/game.service";

export function useCanvasInteractions() {

    const refMouseDownInCanvas = useRef<boolean>(false);
    const refTimestampMouseDown = useRef<number>(0);

    function mouseMove(e: MouseEvent) {
        GameService.mouseMoved(
            e.movementX,
            e.movementY,
            e.clientX,
            e.clientY,
            e.buttons === 1 && refMouseDownInCanvas.current,
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
        GameService.mouseScrolled(e.deltaY, e.clientX, e.clientY);
    }

    function click(duration: number, e: MouseEvent) {
        if (duration < 150) {
            GameService.mouseClicked(e.clientX, e.clientY);
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