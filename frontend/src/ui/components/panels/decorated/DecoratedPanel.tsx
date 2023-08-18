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
    className?: string,
    children?: any;
}

export function DecoratedPanel(props: DecoratedPanelProps) {
    return (
        <div className={joinClassNames([
            "decorated-panel",
            "panel--" + getColor(props),
            props.simpleBorder ? "panel-simplified" : null,
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