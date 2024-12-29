import {joinClassNames} from "../../window/utils";
import "./decoratedPanel.scoped.less";
import React, {ReactElement} from "react";
import {BaseProps} from "../../base/base";

export interface DecoratedPanelProps extends BaseProps {

    ornament?: boolean,
    simple?: boolean
    simpleDashed?: boolean

    blue?: boolean

    pattern?: boolean

    background?: any,

    elementRef?: any,

    children?: any;
}


/**
 * Displays a customizable panel with different styles.
 * Used for windows, sections, elements, items, ...
 */
export function DecoratedPanel(props: DecoratedPanelProps) {
    return (
        <div
            className={joinClassNames([
                "decorated-panel",
                "decorated-panel--" + getColor(props),
                "decorated-panel--" + getBorder(props),
                props.pattern ? "decorated-panel--pattern" : null,
                ...BaseProps.buildBaseClassNames(props),
            ])}
            style={props.style}
            ref={props.elementRef}
        >

            <div className="decorated-panel__texture"/>

            {props.pattern && (<div className="decorated-panel__pattern"/>)}

            {props.background}

            <div className="decorated-panel__content">
                {props.children}
            </div>

            <div className="decorated-panel__border"/>

        </div>
    );

    function getColor(props: DecoratedPanelProps): "default" | "blue" {
        if (props.blue) return "blue";
        return "default";
    }

    function getBorder(props: DecoratedPanelProps): "ornament" | "simple" | "simple-dashed" {
        if (props.ornament) return "ornament";
        if (props.simple) return "simple";
        if (props.simpleDashed) return "simple-dashed";
        return "simple";
    }
}

export namespace DecoratedPanel {

    export interface ImageBackgroundProps extends BaseProps {
        url: string,
        gradient?: boolean,
        desaturated?: boolean,
        reducedOpacity?: boolean,
    }

    export function ImageBackground(props: ImageBackgroundProps): ReactElement {
        return (
            <div
                className={joinClassNames([
                    "decorated-panel-image-background",
                    props.gradient ? "decorated-panel-image-background--gradient" : null,
                    props.desaturated ? "decorated-panel-image-background--desaturated" : null,
                    props.reducedOpacity ? "decorated-panel-image-background--reducedOpacity" : null,
                    ...BaseProps.buildBaseClassNames(props),
                ])}
                style={{
                    backgroundImage: "url('" + props.url + "')",
                    ...props.style,
                }}
            />
        );
    }

    export interface ColorBackgroundProps extends BaseProps {
        color: string,
    }

    export function ColorBackground(props: ColorBackgroundProps): ReactElement {
        return (
            <div
                className={joinClassNames([
                    "decorated-panel-color-background",
                    ...BaseProps.buildBaseClassNames(props),
                ])}
                style={{
                    background: "linear-gradient(to left, transparent 25%, " + props.color + " 75%)",
                    ...props.style,
                }}
            />
        );
    }


}