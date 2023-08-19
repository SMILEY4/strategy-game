import {joinClassNames} from "../../utils";
import "./decoratedPanel.scoped.less";

export type DecoratedPanelColor = "blue" | "red" | "green" | "paper"

export interface DecoratedPanelProps {
    red?: boolean,
    green?: boolean,
    blue?: boolean,
    paper?: boolean,
    color?: DecoratedPanelColor;
    simpleBorder?: boolean,
    floating?: boolean,
    fillParent?: boolean,
    className?: string,
    children?: any;
}

export function DecoratedPanel(props: DecoratedPanelProps) {
    return (
        <div className={joinClassNames([
            "decorated-panel",
            "panel--" + getColor(props),
            props.floating ? "decorated-panel--floating" : null,
            props.simpleBorder ? "decorated-panel--simplified" : null,
            props.fillParent ? "decorated-panel--fill-parent" : null,
            props.className
        ])}>
            <div className="background"/>
            <div className="border"/>
            <div className="content">
                {props.children}
            </div>
        </div>
    );

    function getColor(props: DecoratedPanelProps): DecoratedPanelColor {
        return props.color
            || (props.red ? "red" : undefined)
            || (props.green ? "green" : undefined)
            || (props.blue ? "blue" : undefined)
            || (props.paper ? "paper" : undefined)
            || "red";
    }
}