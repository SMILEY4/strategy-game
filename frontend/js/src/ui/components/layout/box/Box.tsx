import {ReactElement} from "react";
import {BaseProps} from "../../base/base";
import {joinClassNames} from "../../window/utils";
import {BaseBoxProps} from "../BaseBoxProps";
import "./box.scoped.less"

export interface BoxProps extends BaseBoxProps, BaseProps {
    children?: any;
}

export function Box(props: BoxProps): ReactElement {
    const padding = BaseBoxProps.padding(props)
    return (
        <div className={joinClassNames([
            "box",
            padding ? "box--padding-" + padding : null,
            ...BaseProps.buildBaseClassNames(props),
        ])}>
            {props.children}
        </div>
    );
}