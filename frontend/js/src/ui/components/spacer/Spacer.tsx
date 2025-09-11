import {ReactElement} from "react";
import {joinClassNames} from "../window/utils";
import "./spacer.scoped.less";
import {BaseProps} from "../base/base";

export interface SpacerProps extends BaseProps {
    size?: "xs" | "s" | "m" | "l" | "xl" | "xxl",
    size_xs?: boolean
    size_s?: boolean
    size_m?: boolean
    size_l?: boolean
    size_xl?: boolean
    size_xxl?: boolean

    orientation?: "vertical" | "horizontal"
    vertical?: boolean,
    horizontal?: boolean,
}

export function Spacer(props: SpacerProps): ReactElement {
    const size = getSize();
    const orientation = getOrientation();
    return (
        <div
            className={joinClassNames([
                "spacer",
                size ? "spacer--" + size : undefined,
                "spacer--" + orientation,
                ...BaseProps.buildBaseClassNames(props),
            ])}
            style={props.style}
        />
    );

    function getSize(): undefined | "xs" | "s" | "m" | "l" | "xl" | "xxl" {
        if (props.size) return props.size;
        if (props.size_xs) return "xs";
        if (props.size_s) return "s";
        if (props.size_m) return "m";
        if (props.size_l) return "l";
        if (props.size_xl) return "xl";
        if (props.size_xxl) return "xxl";
        return undefined;
    }

    function getOrientation(): "vertical" | "horizontal" {
        if (props.orientation) return props.orientation;
        if (props.vertical) return "vertical";
        if (props.horizontal) return "horizontal";
        return "vertical";
    }

}

export interface WithoutOrientationSpacerProps extends BaseProps {
    size?: "xs" | "s" | "m" | "l" | "xl" | "xxl",
    size_xs?: boolean
    size_s?: boolean
    size_m?: boolean
    size_l?: boolean
    size_xl?: boolean
    size_xxl?: boolean
}

export function VSpacer(props: WithoutOrientationSpacerProps): ReactElement {
    return <Spacer {...props} vertical/>;
}

export function HSpacer(props: WithoutOrientationSpacerProps): ReactElement {
    return <Spacer {...props} horizontal/>;
}