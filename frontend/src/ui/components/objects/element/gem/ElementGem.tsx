import {ReactElement} from "react";
import {joinClassNames} from "../../../utils";
import "./elementGem.css";

export interface ElementGemProps {
    className?: string,
    type?: "div" | "button"
    interactive?: boolean,
    disabled?: boolean,
    onClick?: () => void
    children?: any;
}

export function ElementGem(props: ElementGemProps): ReactElement {
    return (
        <ElementGemWrapper
            className={props.className}
            type={props.type}
            disabled={props.disabled}
            interactive={props.interactive}
            onClick={props.onClick}
        >
            <div className={"element-gem__outer"}>
                <div className={"element-gem__inner"}>
                    {props.children}
                </div>
            </div>
            <div className="element-gem__background"/>
        </ElementGemWrapper>
    );
}


function ElementGemWrapper(props: ElementGemProps): ReactElement {
    const className = joinClassNames([
        "element-gem",
        (props.interactive && !props.disabled) ? "element-gem--interactive" : null,
        props.disabled ? "element-gem--disabled" : null,
        props.className
    ])
    if (props.type == "button") {
        return (
            <button className={className} onClick={props.onClick}>
                {props.children}
            </button>
        );
    } else {
        return (
            <div className={className} onClick={props.onClick}>
                {props.children}
            </div>
        );
    }
}