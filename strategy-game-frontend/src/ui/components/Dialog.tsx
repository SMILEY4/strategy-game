import React, {ReactElement, useEffect, useState} from "react";
import {DialogData} from "../../external/state/ui/uiStore";
import "./dialog.css";
import {useDraggable} from "./useDraggable";
import {useStateRef} from "./useStateRef";


export function Dialog(props: { data: DialogData }): ReactElement {

    const [posX, setPosX] = useState(props.data.initX);
    const [posY, setPosY] = useState(props.data.initY);
    const [width, widthRef, setWidth] = useStateRef(props.data.width);
    const [height, heightRef, setHeight] = useStateRef(props.data.height);

    const [dialogDragRef, onDragMouseDown] = useDraggable(canDragDialog, onDragDialog);
    const [dialogResizeRef, onResizeMouseDown] = useDraggable(canResizeDialog, onResizeDialog);


    useEffect(() => {
        setPosX(props.data.initX);
        setPosY(props.data.initY);
        setWidth(props.data.width);
        setHeight(props.data.height);
    }, [props.data]);


    function canDragDialog(e: any): boolean {
        return e.button === 0 && e.target.className == "dialog";
    }


    function onDragDialog(x: number, y: number, dx: number, dy: number) {
        setPosX(x);
        setPosY(y);
    }

    function canResizeDialog(e: any): boolean {
        return e.button === 0 && e.target.className == "dialog-resizer";
    }


    function onResizeDialog(x: number, y: number, dx: number, dy: number) {
        setWidth(widthRef.current + dx);
        setHeight(heightRef.current + dy);
    }

    return (
        <div
            className={"dialog"}
            style={{
                left: posX + "px",
                top: posY + "px",
                width: width + "px",
                height: height + "px"
            }}
            ref={dialogDragRef}
            onMouseDown={onDragMouseDown}
        >
            <button>X</button>
            {props.data.content}
            <div
                className={"dialog-resizer"}
                ref={dialogResizeRef}
                onMouseDown={onResizeMouseDown}
            >
                //
            </div>
        </div>
    );

}