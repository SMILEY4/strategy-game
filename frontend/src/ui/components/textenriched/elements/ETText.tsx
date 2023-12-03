import {ReactElement} from "react";
import "./etElements.scoped.less";
import {joinClassNames} from "../../utils";

export interface ETTextProps {
    type?: "none" | "pos" | "neg" | "info";
    pos?: boolean,
    neg?: boolean,
    info?: boolean,
    children: string
}

export function ETText(props: ETTextProps): ReactElement {
    const type = getType(props);
    return (
        <span className={joinClassNames([
            "et-element",
            "et-text",
            "et-text--type-" + type,
        ])}>
           {props.children}
        </span>
    );

    function getType(props: ETTextProps): "pos" | "neg" | "info" | "none" {
        if (props.type === "pos" || props.pos) {
            return "pos";
        }
        if (props.type === "neg" || props.neg) {
            return "neg";
        }
        if (props.type === "info" || props.info) {
            return "info";
        }
        return "none";
    }

}