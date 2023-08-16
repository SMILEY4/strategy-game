import {MouseEvent, ReactElement} from "react";
import {joinClassNames} from "../../utils";
import "./inset.scoped.css";

export interface InsetProps {
    children?: any;
    interactiveHover?: boolean,
    interactiveFocus?: boolean,
    onClick?: (e: MouseEvent) => void
    className?: string,
}

export function Inset(props: InsetProps): ReactElement {

    return (
        <div
            className={joinClassNames([
            "inset",
            props.interactiveFocus ? "inset--interactive-focus" : null,
            props.interactiveHover ? "inset--interactive-hover" : null,
            props.className,
        ])}
            onClick={props.onClick}
        >
            {props.children}
        </div>
    );

}