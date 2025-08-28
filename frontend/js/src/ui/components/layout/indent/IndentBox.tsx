import {joinClassNames} from "../../window/utils";
import {BaseProps} from "../../base/base";
import "./indentBox.scoped.less"

export interface IndentBoxProps extends BaseProps {
    children?: any;
}

/**
 * Adds a default indentation to the left side for all child elements
 */
export function IndentBox(props: IndentBoxProps) {
    return (
        <div
            className={joinClassNames([
                "indent-box",
                ...BaseProps.buildBaseClassNames(props),
            ])}
            style={props.style}
        >
            {props.children}
        </div>
    );
}