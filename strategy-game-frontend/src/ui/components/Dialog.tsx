import React, {ReactElement, useEffect, useRef, useState} from "react";
import {DialogData} from "../../external/state/ui/uiStore";
import "./dialog.css";


export function Dialog(props: { data: DialogData }): ReactElement {

    const dialogRef = useRef<HTMLDivElement>(null);
    const [posX, setPosX] = useState(props.data.initX);
    const [posY, setPosY] = useState(props.data.initY);
    const relX = useRef(0);
    const relY = useRef(0);

    useEffect(() => {
        setPosX(props.data.initX)
        setPosY(props.data.initY)
    }, [props.data])

    function onMouseDown(e: any) {
        if (e.button === 0 && e.target.className == "dialog" && dialogRef && dialogRef.current) {
            relX.current = (e.pageX - dialogRef.current.getBoundingClientRect().x);
            relY.current = (e.pageY - dialogRef.current.getBoundingClientRect().y);
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
        setPosX(e.pageX - relX.current);
        setPosY(e.pageY - relY.current);
        e.stopPropagation();
        e.preventDefault();
    }

    return (
        <div
            ref={dialogRef}
            className={"dialog"}
            style={{
                left: posX + "px",
                top: posY + "px",
                width: props.data.width,
                height: props.data.height
            }}
            onMouseDown={onMouseDown}
        >
            <button>X</button>
            {props.data.content}
        </div>
    );

}