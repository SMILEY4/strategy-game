import React, {ReactElement, useEffect, useState} from "react";
import {AiOutlineClose} from "react-icons/ai";
import {BsPinAngle, BsTextareaResize} from "react-icons/bs";
import {DialogData, UiStore} from "../../external/state/ui/uiStore";
import "./dialog.css";
import {useDraggable} from "./useDraggable";
import {useStateRef} from "./useStateRef";


export function Dialog(props: { data: DialogData }): ReactElement {

    const [posX, setPosX] = useState(props.data.initX);
    const [posY, setPosY] = useState(props.data.initY);
    const [width, widthRef, setWidth] = useStateRef(props.data.width);
    const [height, heightRef, setHeight] = useStateRef(props.data.height);

    const closeDialog = UiStore.useState().removeDialog
    const changeId = UiStore.useState().changeId
    const [dialogDragRef, onDragMouseDown] = useDraggable(canDragDialog, onDragDialog);
    const [dialogResizeRef, onResizeMouseDown] = useDraggable(canResizeDialog, onResizeDialog);


    useEffect(() => {
        setPosX(props.data.initX);
        setPosY(props.data.initY);
        setWidth(props.data.width);
        setHeight(props.data.height);
    }, [props.data.initY, props.data.initX, props.data.width, props.data.height]);


    function canDragDialog(e: any): boolean {
        return e.button === 0 && e.target.className == "dialog";
    }


    function onDragDialog(x: number, y: number, dx: number, dy: number) {
        setPosX(x);
        setPosY(y);
    }

    function canResizeDialog(e: any): boolean {
        return e.button === 0
    }


    function onResizeDialog(x: number, y: number, dx: number, dy: number) {
        setWidth(widthRef.current + dx);
        setHeight(heightRef.current + dy);
    }

    function onRequestClose() {
        closeDialog(props.data.id)
    }

    function onRequestPin() {
        changeId(props.data.id, crypto.randomUUID())
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
            <div>{props.data.id}</div>
            <button onClick={onRequestClose}><AiOutlineClose/></button>
            <button onClick={onRequestPin}><BsPinAngle/></button>
            {props.data.content}
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