import React, {ReactElement, useEffect, useState} from "react";
import {AiOutlineClose} from "react-icons/ai";
import {BsPinAngle, BsTextareaResize} from "react-icons/bs";
import {Hooks} from "../../../core/hooks";
import {DialogData} from "../../../external/state/ui/uiStore";
import "./dialog.css";
import {useDraggable} from "../primitives/useDraggable";
import {useStateRef} from "../primitives/useStateRef";


export function Dialog(props: { data: DialogData }): ReactElement {

    const [posX, setPosX] = useState(props.data.initX);
    const [posY, setPosY] = useState(props.data.initY);
    const [width, widthRef, setWidth] = useStateRef(props.data.width);
    const [height, heightRef, setHeight] = useStateRef(props.data.height);

    const closeDialog = Hooks.useCloseDialog(props.data.windowId);
    const pinDialog = Hooks.usePinDialog(props.data.windowId);

    const [dialogDragRef, onDragMouseDown] = useDraggable(canDragDialog, onDragDialog);
    const [dialogResizeRef, onResizeMouseDown] = useDraggable(canResizeDialog, onResizeDialog);


    useEffect(() => {
        setPosX(props.data.initX);
        setPosY(props.data.initY);
        setWidth(props.data.width);
        setHeight(props.data.height);
    }, [props.data.initY, props.data.initX, props.data.width, props.data.height]);


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

            <div className="dialog-header">
                <div className="dialog-title">{props.data.menuId}</div>
                {props.data.enablePin && (
                    <div className="dialog-pin" onClick={pinDialog}><BsPinAngle size={20}/></div>
                )}
                <div className="dialog-close" onClick={closeDialog}><AiOutlineClose size={20}/></div>
            </div>

            <div className="dialog-body">
                {props.data.content}
            </div>

            <div
                className={"dialog-resizer"}
                ref={dialogResizeRef}
                onMouseDown={onResizeMouseDown}
            >
                <BsTextareaResize/>
            </div>

        </div>
    );

}