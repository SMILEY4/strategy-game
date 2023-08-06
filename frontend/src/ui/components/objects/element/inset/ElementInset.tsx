import {ReactElement} from "react";
import {joinClassNames} from "../../../utils";
import "./elementInset.css";

export interface ElementInsetProps {
    children?: any;
    interactive?: boolean,
    className?: string,

}

export function ElementInset(props: ElementInsetProps): ReactElement {

    return (
        <div className={joinClassNames([
            "element-inset",
            props.interactive ? "element-inset--interactive" : null,
            props.className
        ])}>
            {props.children}
        </div>
    );

}