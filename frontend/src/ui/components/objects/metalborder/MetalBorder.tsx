import {ReactElement} from "react";
import "./metalBorder.scoped.css";
import "../../variables.css";
import {joinClassNames} from "../../utils";

export interface MetalBorderProps {
    type: "gold" | "silver"
    round?: boolean,
    className?: string;
    classNameContent?: string;
    onClick?: () => void,
    children?: any;
}

export function MetalBorder(props: MetalBorderProps): ReactElement {
    return (
        <div
            className={joinClassNames([
                "border",
                "metal-border",
                "metal-border__outer",
                "metal-border--" + props.type,
                props.className,
                props.round ? "border--round metal-border--round" : null,
            ])}
            onClick={props.onClick}
        >
            <div className="metal-border__inner">
                <div className={joinClassNames([
                    "border-content",
                    "metal-border__content",
                    props.classNameContent,
                ])}>
                    {props.children}
                </div>
            </div>
        </div>
    );
}