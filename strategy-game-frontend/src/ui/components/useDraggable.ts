import {MouseEvent, RefObject, useRef} from "react";

export function useDraggable(
    mouseDownFilter: (e: MouseEvent<any>) => boolean,
    onDrag: (x: number, y: number, dx: number, dy: number) => void
): [RefObject<HTMLDivElement>, (e: MouseEvent<any>) => void] {

    const draggableRef = useRef<HTMLDivElement>(null);
    const relX = useRef(0);
    const relY = useRef(0);
    const lastX = useRef(0);
    const lastY = useRef(0);

    function onMouseDown(e: MouseEvent<any>): void {
        if (draggableRef && draggableRef.current && mouseDownFilter(e)) {
            relX.current = (e.pageX - draggableRef.current.getBoundingClientRect().x);
            relY.current = (e.pageY - draggableRef.current.getBoundingClientRect().y);
            lastX.current = e.pageX - relX.current;
            lastY.current = e.pageY - relY.current;
            document.addEventListener("mousemove", onMouseMove);
            document.addEventListener("mouseup", onMouseUp);
            e.stopPropagation();
            e.preventDefault();
        }
    }

    function onMouseUp(e: any) {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
        e.stopPropagation();
        e.preventDefault();
    }

    function onMouseMove(e: any) {
        const x = e.pageX - relX.current;
        const y = e.pageY - relY.current;
        const dx = x - lastX.current;
        const dy = y - lastY.current;
        onDrag(x, y, dx, dy);
        lastX.current = e.pageX - relX.current;
        lastY.current = e.pageY - relY.current;
        e.stopPropagation();
        e.preventDefault();
    }

    return [draggableRef, onMouseDown];
}