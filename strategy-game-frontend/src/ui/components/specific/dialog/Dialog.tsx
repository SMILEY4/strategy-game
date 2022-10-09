import React, {ReactElement} from "react";
import {AiOutlineClose} from "react-icons/ai";
import {BsPinAngle, BsTextareaResize} from "react-icons/bs";
import {UiFrameData} from "../../../../external/state/ui/uiStore";
import {AppConfig} from "../../../../main";
import {useMenuFrame} from "../../primitives/menuFramePrimitive";
import "./dialog.css";

export function Dialog(props: { data: UiFrameData }): ReactElement {

    const uiService = AppConfig.di.get(AppConfig.DIQ.UIService);

    const {
        posX,
        posY,
        width,
        height,
        onDragMouseDown,
        onResizeMouseDown,
        refDragHandle,
        refResizeHandle,
    } = useMenuFrame(props.data, target => (target.className == "dialog" || target.className == "dialog-header" || target.className == "dialog-title"));

    return (
        <div
            className={"dialog"}
            style={{
                left: posX + "px",
                top: posY + "px",
                width: width + "px",
                height: height + "px"
            }}
            ref={refDragHandle}
            onMouseDown={onDragMouseDown}
        >

            <div className="dialog-header">
                <div className="dialog-title">{props.data.menuId}</div>
                {props.data.enablePin && (
                    <div className="dialog-pin" onClick={() => uiService.pin(props.data.frameId)}><BsPinAngle size={20}/></div>
                )}
                <div className="dialog-close" onClick={() => uiService.close(props.data.frameId)}><AiOutlineClose size={20}/></div>
            </div>

            <div className="dialog-body">
                {props.data.content}
            </div>

            <div
                className={"dialog-resizer"}
                ref={refResizeHandle}
                onMouseDown={onResizeMouseDown}
            >
                <BsTextareaResize/>
            </div>

        </div>
    );

}
