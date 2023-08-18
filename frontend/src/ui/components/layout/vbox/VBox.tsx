import {ReactElement} from "react";
import {joinClassNames} from "../../utils";
import "./vbox.scoped.less";

export interface VBoxProps {

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

    fillParent?: boolean,
    className?: string,
    children?: any,
}

export function VBox(props: VBoxProps): ReactElement {
    return (
        <div
            className={joinClassNames([
                "vbox",
                "vbox-vert-" + vertical(props),
                "vbox-hor-" + horizontal(props),
                props.fillParent ? "vbox--fill" : null,
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