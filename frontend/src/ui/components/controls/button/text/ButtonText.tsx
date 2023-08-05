import React, {ReactElement} from "react";
import {joinClassNames} from "../../../utils";
import "./buttonText.css";

export interface ButtonGemProps {
    onClick?: () => void,
    className?: string
    children?: any,
}

export function ButtonText(props: ButtonGemProps): ReactElement {
    return (
        <button
            onClick={props.onClick}
            className={joinClassNames(["button-text", props.className])}
        >
            {props.children}
        </button>
    );
}