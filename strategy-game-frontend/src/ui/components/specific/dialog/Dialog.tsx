import React, {ReactElement, useEffect, useState} from "react";
import {AiOutlineClose} from "react-icons/ai";
import {BsPinAngle, BsTextareaResize} from "react-icons/bs";
import {UiStateHooks} from "../../../../external/state/ui/uiStateHooks";
import {DialogData} from "../../../../external/state/ui/uiStore";
import {useDialog} from "../../primitives/dialogPrimitive";
import "./dialog.css";

export function Dialog(props: { data: DialogData }): ReactElement {

    const closeDialog = UiStateHooks.useCloseDialog(props.data.windowId);
    const pinDialog = UiStateHooks.usePinDialog(props.data.windowId);

    const {
        posX,
        posY,
        width,
        height,
        onDragMouseDown,
        onResizeMouseDown,
        refDialogDragHandle,
        refDialogResizeHandle,
    } = useDialog(props.data)

    return (
        <div
            className={"dialog"}
            style={{
                left: posX + "px",
                top: posY + "px",
                width: width + "px",
                height: height + "px"
            }}
            ref={refDialogDragHandle}
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
                ref={refDialogResizeHandle}
                onMouseDown={onResizeMouseDown}
            >
                <BsTextareaResize/>
            </div>

        </div>
    );

}
