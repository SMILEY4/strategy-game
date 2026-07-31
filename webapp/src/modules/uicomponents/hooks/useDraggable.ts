import {type MouseEvent as ReactMouseEvent, useRef, useState} from "react";

export interface UseDraggableData {
    ref: React.RefObject<HTMLDivElement | null>;
    onMouseDown: (e: ReactMouseEvent) => void;
    isDragging: boolean;
}

export function useDraggable(
    mouseDownFilter: (e: ReactMouseEvent) => boolean,
    onDragPrepare: () => void,
    onDrag: (x: number, y: number, dx: number, dy: number) => void
): UseDraggableData {

    const draggableRef = useRef<HTMLDivElement>(null);
    const relX = useRef(0);
    const relY = useRef(0);
    const lastX = useRef(0);
    const lastY = useRef(0);
    const [isDragging, setIsDragging] = useState(false);

    function onMouseDown(e: ReactMouseEvent<any>): void {
        if (draggableRef.current && mouseDownFilter(e)) {
            setIsDragging(true);
            relX.current = (e.pageX - draggableRef.current.getBoundingClientRect().x);
            relY.current = (e.pageY - draggableRef.current.getBoundingClientRect().y);
            lastX.current = e.pageX - relX.current;
            lastY.current = e.pageY - relY.current;
            document.addEventListener("mousemove", onMouseMove);
            document.addEventListener("mouseup", onMouseUp);
            e.stopPropagation();
            e.preventDefault();
            onDragPrepare()
        }
    }

    function onMouseUp(e: MouseEvent) {
        setIsDragging(false);
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
        e.stopPropagation();
        e.preventDefault();
    }

    function onMouseMove(e: MouseEvent) {
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

    return {ref: draggableRef, onMouseDown, isDragging};
}