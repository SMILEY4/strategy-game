import {useEffect, useState} from "react";
import {UiFrameData} from "../../../external/state/ui/uiStore";
import {useDraggable} from "./useDraggable";
import {useStateRef} from "./useStateRef";

export function useMenuFrame(data: UiFrameData, conditionAllowDrag: (eventTarget: any) => boolean) {

    const [posX, setPosX] = useState(data.initX);
    const [posY, setPosY] = useState(data.initY);
    const [width, widthRef, setWidth] = useStateRef(data.width);
    const [height, heightRef, setHeight] = useStateRef(data.height);

    const [dialogDragRef, onDragMouseDown] = useDraggable(canDrag, () => undefined, onDrag);
    const [dialogResizeRef, onResizeMouseDown] = useDraggable(canResize, () => undefined, onResize);


    useEffect(() => {
        setPosX(data.initX);
        setPosY(data.initY);
        setWidth(data.width);
        setHeight(data.height);
    }, [data.initY, data.initX, data.width, data.height]);


    function canDrag(e: any): boolean {
        return e.button === 0 && conditionAllowDrag(e.target)
    }

    function onDrag(x: number, y: number, dx: number, dy: number) {
        setPosX(x);
        setPosY(y);
    }

    function canResize(e: any): boolean {
        return e.button === 0;
    }

    function onResize(x: number, y: number, dx: number, dy: number) {
        setWidth(widthRef.current + dx);
        setHeight(heightRef.current + dy);
    }

    return {
        posX: posX,
        posY: posY,
        width: width,
        height: height,
        onDragMouseDown: onDragMouseDown,
        onResizeMouseDown: onResizeMouseDown,
        refDragHandle: dialogDragRef,
        refResizeHandle: dialogResizeRef,
    };

}