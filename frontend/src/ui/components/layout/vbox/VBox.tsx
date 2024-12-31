import {ReactElement} from "react";
import {joinClassNames} from "../../window/utils";
import {BaseBoxProps} from "../BaseBoxProps";
import "./vbox.scoped.less";
import {BaseProps} from "../../base/base";
import {BaseListBoxProps} from "../BaseListBoxProps";

export interface VBoxProps extends BaseListBoxProps, BaseProps {

    // vertical alignment
    centerVertical?: boolean,
    top?: boolean,
    bottom?: boolean,
    spaceBetween?: boolean,
    spaceAround?: boolean,
    spaceEvenly?: boolean,

    // horizontal alignment
    centerHorizontal?: boolean,
    left?: boolean,
    right?: boolean,
    stretch?: boolean,

    center?: boolean,

    children?: any,
}

export function VBox(props: VBoxProps): ReactElement {
    const gap = BaseListBoxProps.gap(props);
    const padding = BaseBoxProps.padding(props);
    return (
        <div
            className={joinClassNames([
                "vbox",
                "vbox-vert-" + vertical(props),
                "vbox-hor-" + horizontal(props),
                gap ? "vbox--gap-" + gap : null,
                padding ? "vbox--padding-" + padding : null,
                props.scrollable ? "vbox--scrollable" : null,
                props.wrap ? "vbox--wrap" : null,
                ...BaseProps.buildBaseClassNames(props),
            ])}
            style={props.style}
        >
            {props.children}
        </div>
    );

    function vertical(props: VBoxProps) {
        if (props.centerVertical || props.center) return "center";
        if (props.top) return "top";
        if (props.bottom) return "bottom";
        if (props.spaceBetween) return "space-between";
        if (props.spaceEvenly) return "space-evenly";
        if (props.spaceAround) return "space-around";
        return "top";
    }

    function horizontal(props: VBoxProps) {
        if (props.centerHorizontal || props.center) return "center";
        if (props.left) return "left";
        if (props.right) return "right";
        if (props.stretch) return "stretch";
        return "stretch";
    }

}