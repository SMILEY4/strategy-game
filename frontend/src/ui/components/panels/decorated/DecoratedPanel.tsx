import {joinClassNames} from "../../utils";
import "./decoratedPanel.scoped.less";
import React, {CSSProperties, ReactElement} from "react";

export interface DecoratedPanelProps {
    accent?: "blue"
    simpleBorder?: boolean,
    pattern?: boolean,
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
                props.accent ? "decorated-panel--" + props.accent : "decorated-panel--neutral",
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
            {props.pattern && (<div className="background-pattern"/>)}
            {props.background}
            <div className="content">
                {props.children}
            </div>
            <div className="border"/>
        </div>
    );
}

export function DecoratedPanelImageBackground(props: { url: string, desaturated?: boolean, reducedOpacity?: boolean }): ReactElement {
    return (
        <div
            className={joinClassNames([
                "decorated-panel-image-background",
                props.desaturated ? "decorated-panel-image-background--desaturated" : null,
                props.reducedOpacity ? "decorated-panel-image-background--reducedOpacity" : null
            ])}
            style={{backgroundImage: "url('" + props.url + "')"}}
        />
    )
}

export function DecoratedPanelColorBackground(props: { color: string }): ReactElement {
    return (
        <div
            className={joinClassNames([
                "decorated-panel-color-background",
            ])}
            style={{background: "linear-gradient(to right, transparent 25%, " + props.color + " 75%)"}}
        />
    )
}