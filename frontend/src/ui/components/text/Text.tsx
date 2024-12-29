import {ReactElement} from "react";
import {joinClassNames} from "../window/utils";
import "./text.scoped.less"
import {BaseProps} from "../base/base";

export interface TextProps extends BaseProps {

    align?: "left" | "center" | "right"
    left?: boolean,
    center?: boolean,
    right?: boolean,

    type?: "positive" | "negative" | "secondary"
    positive?: boolean,
    negative?: boolean,
    secondary?: boolean,

    strikethrough?: boolean,
    // relative?: boolean,
    children?: any;
}

export function Text(props: TextProps): ReactElement {
    return (
        <p style={props.style}
            className={joinClassNames([
                "text",
                "text--" + getAlignment(),
                "text--" + getType(),
                props.strikethrough ? "text--strikethrough" : null,
                // props.relative ? "text--relative" : null,
                ...BaseProps.buildBaseClassNames(props)
            ])}
        >
            {props.children}
        </p>
    );

    function getAlignment(): "left" | "center" | "right" {
        if(props.align) return props.align
        if(props.left) return "left"
        if(props.center) return "center"
        if(props.right) return "right"
        return "left"
    }

    function getType(): "default" | "positive" | "negative" | "secondary" {
        if(props.type) return props.type
        if(props.positive) return "positive"
        if(props.negative) return "negative"
        if(props.secondary) return "secondary"
        return "default"
    }

}