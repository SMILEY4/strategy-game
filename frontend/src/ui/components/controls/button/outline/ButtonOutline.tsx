import React, {ReactElement} from "react";
import {joinClassNames} from "../../../utils";
import "./buttonOutline.css";

export interface ButtonOutlineProps {
    onClick?: () => void,
    disabled?: boolean,
    className?: string,
    children?: any,
}

export function ButtonOutline(props: ButtonOutlineProps): ReactElement {
    return (
        <button
            className={joinClassNames([
                "button-outline",
                props.disabled === true ? "button-outline--disabled" : null,
                props.className,
            ])}
            onClick={props.disabled === true ? (() => undefined) : props.onClick}
        >
            {props.children}
        </button>
    );

}