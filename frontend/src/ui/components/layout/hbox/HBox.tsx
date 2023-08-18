import {ReactElement} from "react";
import {joinClassNames} from "../../utils";
import "./hbox.scoped.less";

export interface HBoxProps {

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

    fillParent?: boolean,
    className?: string,
    children?: any,
}

export function HBox(props: HBoxProps): ReactElement {
    return (
        <div
            className={joinClassNames([
                "hbox",
                "hbox-vert-" + vertical(props),
                "hbox-hor-" + horizontal(props),
                props.fillParent ? "hbox--fill" : null,
                props.className,
            ])}
        >
            {props.children}
        </div>
    );

    function vertical(props: HBoxProps) {
        if (props.centerVertical || props.center) {
            return "center";
        }
        if (props.top) {
            return "top";
        }
        if (props.bottom) {
            return "bottom";
        }
        if (props.stretch) {
            return "stretch";
        }
        return "unknown";
    }

    function horizontal(props: HBoxProps) {
        if (props.centerHorizontal || props.center) {
            return "center";
        }
        if (props.left) {
            return "left";
        }
        if (props.right) {
            return "right";
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

}