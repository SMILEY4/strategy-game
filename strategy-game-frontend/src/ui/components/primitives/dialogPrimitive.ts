import {useEffect, useState} from "react";
import {DialogData} from "../../../external/state/ui/uiStore";
import {useDraggable} from "./useDraggable";
import {useStateRef} from "./useStateRef";

export function useDialog(data: DialogData) {

    const [posX, setPosX] = useState(data.initX);
    const [posY, setPosY] = useState(data.initY);
    const [width, widthRef, setWidth] = useStateRef(data.width);
    const [height, heightRef, setHeight] = useStateRef(data.height);

    const [dialogDragRef, onDragMouseDown] = useDraggable(canDragDialog, onDragDialog);
    const [dialogResizeRef, onResizeMouseDown] = useDraggable(canResizeDialog, onResizeDialog);


    useEffect(() => {
        setPosX(data.initX);
        setPosY(data.initY);
        setWidth(data.width);
        setHeight(data.height);
    }, [data.initY, data.initX, data.width, data.height]);


    function canDragDialog(e: any): boolean {
        return e.button === 0
            && (e.target.className == "dialog" || e.target.className == "dialog-header" || e.target.className == "dialog-title");
    }


    function onDragDialog(x: number, y: number, dx: number, dy: number) {
        setPosX(x);
        setPosY(y);
    }

    function canResizeDialog(e: any): boolean {
        return e.button === 0;
    }


    function onResizeDialog(x: number, y: number, dx: number, dy: number) {
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
        refDialogDragHandle: dialogDragRef,
        refDialogResizeHandle: dialogResizeRef,
    };

}