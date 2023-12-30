import {CSSProperties, ReactElement} from "react";
import {joinClassNames} from "../utils";
import "./text.scoped.less"

export interface TextProps {
    fillParent?: boolean,
    align?: "left" | "center" | "right"
    type?: "positive" | "negative" | "secondary" | "default"
    strikethrough?: boolean,
    onLight?: boolean,
    relative?: boolean,
    className?: string,
    children?: any;
    style?: CSSProperties
}

export function Text(props: TextProps): ReactElement {
    return (
        <p style={props.style}
            className={joinClassNames([
                "text",
                props.fillParent ? "text--fill-parent" : null,
                props.relative ? "text--relative" : null,
                props.strikethrough ? "text--strikethrough" : null,
                props.onLight ? "text--on-light" : null,
                "text--" + (props.align ?? "left"),
                props.type ? "text--" + props.type : null,
                props.className,
            ])}
        >
            {props.children}
        </p>
    );
}