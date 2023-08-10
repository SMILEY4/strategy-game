import {MouseEvent, ReactElement} from "react";
import {joinClassNames} from "../../utils";
import "./depression.css";
import "./../variables.css";

export interface DepressionProps {
    children?: any;
    interactiveHover?: boolean,
    interactiveFocus?: boolean,
    onClick?: (e: MouseEvent) => void
    className?: string,
}

export function Depression(props: DepressionProps): ReactElement {

    return (
        <div
            className={joinClassNames([
            "depression",
            props.interactiveFocus ? "depression--interactive-focus" : null,
            props.interactiveHover ? "depression--interactive-hover" : null,
            props.className,
        ])}
            onClick={props.onClick}
        >
            {props.children}
        </div>
    );

}