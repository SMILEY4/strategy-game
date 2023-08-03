import React, {ReactElement} from "react";
import {MetalBorder} from "../metalborder/MetalBorder";
import {GemElement} from "../gemelement/GemElement";
import "./button.css"

export interface ButtonProps {
    children?: any,
    onClick?: () => void
}

export function Button(props: ButtonProps): ReactElement {
    return (
        <MetalBorder className="button">
            <GemElement interactive onClick={props.onClick}>
                {props.children}
            </GemElement>
        </MetalBorder>
    )
}