import {joinClassNames} from "../../utils";
import "./decoratedPanel.scoped.less";
import {CSSProperties} from "react";

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
    noPadding?: boolean,
    paddingSmall?: boolean,
    className?: string,
    style?: CSSProperties,
    background?: any,
    children?: any;
    elementRef?: any,
}

export function DecoratedPanel(props: DecoratedPanelProps) {
    return (
        <div
            className={joinClassNames([
                "decorated-panel",
                "panel--" + getColor(props),
                props.floating ? "decorated-panel--floating" : null,
                props.noPadding ? "decorated-panel--no-padding" : null,
                props.paddingSmall ? "decorated-panel--small-padding" : null,
                props.simpleBorder ? "decorated-panel--simplified" : null,
                props.fillParent ? "decorated-panel--fill-parent" : null,
                props.className,
            ])}
            style={props.style}
            ref={props.elementRef}
        >
            <div className="background"/>
            {props.background}
            <div className="content">
                {props.children}
            </div>
            <div className="border"/>
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