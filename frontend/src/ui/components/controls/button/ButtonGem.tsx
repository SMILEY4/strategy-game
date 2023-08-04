import React, {ReactElement} from "react";
import {BorderMetallic} from "../../objects/border/metallic/BorderMetallic";
import {ElementGem} from "../../objects/element/gem/ElementGem";
import "./buttonGem.css"

export interface ButtonGemProps {
    onClick?: () => void,
    border?: "gold" | "silver"
    children?: any,
}

export function ButtonGem(props: ButtonGemProps): ReactElement {
    return (
        <BorderMetallic color={props.border} className="button-gem">
            <ElementGem interactive onClick={props.onClick}>
                {props.children}
            </ElementGem>
        </BorderMetallic>
    )
}