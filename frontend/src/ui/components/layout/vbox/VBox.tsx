import {ReactElement} from "react";
import {joinClassNames} from "../../utils";
import {BaseBoxProperties} from "../BaseBoxProperties";
import "./vbox.scoped.less";

export interface VBoxProps extends BaseBoxProperties {

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

    className?: string,
    children?: any,
}

export function VBox(props: VBoxProps): ReactElement {
    const gap = BaseBoxProperties.gap(props)
    const padding = BaseBoxProperties.padding(props)
    return (
        <div
            className={joinClassNames([
                "vbox",
                "vbox-vert-" + vertical(props),
                "vbox-hor-" + horizontal(props),
                gap ? "vbox--gap-" + gap : null,
                padding ? "vbox--padding-" + padding : null,
                props.fillParent ? "vbox--fill" : null,
                props.fillParentWidth ? "vbox--fill-width" : null,
                props.fillParentHeight ? "vbox--fill-height" : null,
                props.scrollable ? "vbox--scrollable" : null,
                props.stableScrollbar ? "vbox--stable-scrollbar" : null,
                props.wrap ? "vbox--wrap" : null,
                props.className,
            ])}
        >
            {props.children}
        </div>
    );

    function vertical(props: VBoxProps) {
        if (props.centerVertical || props.center) {
            return "center";
        }
        if (props.top) {
            return "top";
        }
        if (props.bottom) {
            return "bottom";
        }
        if (props.spaceBetween) {
            return "space-between";
        }
        if (props.spaceEvenly) {
            return "space-evenly";
        }
        if (props.spaceAround) {
            return "space-around";
        }
        return "unknown";
    }

    function horizontal(props: VBoxProps) {
        if (props.centerHorizontal || props.center) {
            return "center";
        }
        if (props.left) {
            return "left";
        }
        if (props.right) {
            return "right";
        }
        if (props.stretch) {
            return "stretch";
        }
        return "unknown";
    }

}