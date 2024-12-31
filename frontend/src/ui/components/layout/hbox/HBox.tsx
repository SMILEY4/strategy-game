import {ReactElement} from "react";
import {joinClassNames} from "../../window/utils";
import {BaseBoxProps} from "../BaseBoxProps";
import "./hbox.scoped.less";
import {BaseProps} from "../../base/base";
import {BaseListBoxProps} from "../BaseListBoxProps";

export interface HBoxProps extends BaseListBoxProps, BaseProps  {

    // vertical alignment
    centerVertical?: boolean,
    top?: boolean,
    bottom?: boolean,
    stretch?: boolean,

    // horizontal alignment
    centerHorizontal?: boolean,
    left?: boolean,
    right?: boolean,
    spaceBetween?: boolean,
    spaceAround?: boolean,
    spaceEvenly?: boolean,

    center?: boolean,

    children?: any,
}

export function HBox(props: HBoxProps): ReactElement {
    const gap = BaseListBoxProps.gap(props)
    const padding = BaseBoxProps.padding(props)
    return (
        <div
            className={joinClassNames([
                "hbox",
                "hbox-vert-" + vertical(props),
                "hbox-hor-" + horizontal(props),
                gap ? "hbox--gap-" + gap : null,
                padding ? "hbox--padding-" + padding : null,
                props.scrollable ? "hbox--scrollable" : null,
                props.wrap ? "hbox--wrap" : null,
                ...BaseProps.buildBaseClassNames(props)
            ])}
            style={props.style}
        >
            {props.children}
        </div>
    );

    function vertical(props: HBoxProps) {
        if (props.centerVertical || props.center) return "center";
        if (props.top) return "top";
        if (props.bottom) return "bottom";
        if (props.stretch) return "stretch";
        return "center";
    }

    function horizontal(props: HBoxProps) {
        if (props.centerHorizontal || props.center) return "center";
        if (props.left) return "left";
        if (props.right) return "right";
        if (props.spaceBetween) return "space-between";
        if (props.spaceEvenly) return "space-evenly";
        if (props.spaceAround) return "space-around";
        return "left";
    }

}