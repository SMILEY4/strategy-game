import React, {ReactElement} from "react";
import {BorderMetallic} from "../../../objects/border/metallic/BorderMetallic";
import {ElementGem} from "../../../objects/element/gem/ElementGem";
import "./buttonGem.css";
import {joinClassNames} from "../../../utils";

export interface ButtonGemProps {
    onClick?: () => void,
    border?: "gold" | "silver"
    disabled?: boolean,
    className?: string,
    children?: any,
}

export function ButtonGem(props: ButtonGemProps): ReactElement {
    return (
        <BorderMetallic color={props.border} className={joinClassNames(["button-gem", props.className])}>
            <ElementGem
                type="button"
                interactive
                disabled={props.disabled}
                onClick={props.disabled === true ? (() => undefined) :  props.onClick}
            >
                {props.children}
            </ElementGem>
        </BorderMetallic>
    );
}