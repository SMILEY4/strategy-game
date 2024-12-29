import {joinClassNames} from "../../utils";
import "./decoratedPanel.scoped.less";
import React, {CSSProperties, ReactElement} from "react";

export interface DecoratedPanelProps {
    accent?: "blue"
    simpleBorder?: boolean,
    simpleDashedBorder?: boolean,
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
                props.simpleDashedBorder ? "decorated-panel--simplified-dashed" : null,
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

export function DecoratedPanelImageBackground(props: {
    url: string,
    gradient?: boolean,
    desaturated?: boolean,
    reducedOpacity?: boolean,
    className?: string
}): ReactElement {
    return (
        <div
            className={joinClassNames([
                "decorated-panel-image-background",
                props.gradient ? "decorated-panel-image-background--gradient" : null,
                props.desaturated ? "decorated-panel-image-background--desaturated" : null,
                props.reducedOpacity ? "decorated-panel-image-background--reducedOpacity" : null,
                props.className
            ])}
            style={{backgroundImage: "url('" + props.url + "')"}}
        />
    )
}

export function DecoratedPanelColorBackground(props: {
    color: string,
    className?: string
}): ReactElement {
    return (
        <div
            className={joinClassNames([
                "decorated-panel-color-background",
                props.className
            ])}
            style={{background: "linear-gradient(to left, transparent 25%, " + props.color + " 75%)"}}
        />
    )
}