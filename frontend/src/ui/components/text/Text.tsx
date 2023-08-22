import {ReactElement} from "react";
import {joinClassNames} from "../utils";
import "./text.scoped.less"

export interface TextProps {
    fillParent?: boolean,
    align?: "left" | "center" | "right"
    className?: string,
    children?: any;
}

export function Text(props: TextProps): ReactElement {
    return (
        <p
            className={joinClassNames([
                "text",
                props.fillParent ? "text--fill-parent" : null,
                "text--" + (props.align || "left"),
                props.className,
            ])}
        >
            {props.children}
        </p>
    );
}