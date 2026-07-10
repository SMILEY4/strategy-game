import classNames from "classnames";
import type {ComponentPropsWithoutRef, ReactElement} from "react";
import "./responsiveLayout.less";

type Direction =
    | "left-to-right"
    | "right-to-left"
    | "top-to-bottom"
    | "bottom-to-top"

type DirectionShorthands = {
    leftToRight?: boolean;
    rightToLeft?: boolean;
    topToBottom?: boolean;
    bottomToTop?: boolean;
};

type Alignment =
    | "center"
    | "top-center"
    | "top-left"
    | "top-right"
    | "bottom-center"
    | "bottom-left"
    | "bottom-right"
    | "center-left"
    | "center-right"
    | "left"
    | "right"
    | "top"
    | "bottom"

type AlignmentShorthands = {
    center?: boolean,
    topCenter?: boolean,
    topLeft?: boolean,
    topRight?: boolean,
    bottomCenter?: boolean,
    bottomLeft?: boolean,
    bottomRight?: boolean,
    centerLeft?: boolean,
    centerRight?: boolean,
    left?: boolean,
    right?: boolean,
    top?: boolean,
    bottom?: boolean,
};

type Spacing =
    | "3xs"
    | "2xs"
    | "xs"
    | "s"
    | "m"
    | "l"
    | "xl"
    | "2xl"
    | "3xl";

type SpacingShorthands = {
    spacing3xs?: boolean;
    spacing2xs?: boolean;
    spacingXs?: boolean;
    spacingS?: boolean;
    spacingM?: boolean;
    spacingL?: boolean;
    spacingXl?: boolean;
    spacing2xl?: boolean;
    spacing3xl?: boolean;
};

type PaddingShorthands = {
    padding3xs?: boolean;
    padding2xs?: boolean;
    paddingXs?: boolean;
    paddingS?: boolean;
    paddingM?: boolean;
    paddingL?: boolean;
    paddingXl?: boolean;
    padding2xl?: boolean;
    padding3xl?: boolean;
};

type ResponsiveProp<T> = {
    base?: T,
    xs?: T,
    s?: T,
    m?: T,
    l?: T,
}

export type ResponsiveLayoutProps = {
        direction?: Direction | ResponsiveProp<Direction>;
        alignment?: Alignment | ResponsiveProp<Alignment>;
        spacing?: Spacing | ResponsiveProp<Spacing>;
        padding?: Spacing | ResponsiveProp<Spacing>;
    }
    & ComponentPropsWithoutRef<"div">
    & DirectionShorthands
    & AlignmentShorthands
    & SpacingShorthands
    & PaddingShorthands;

export function ResponsiveLayout(props: ResponsiveLayoutProps): ReactElement {

    const {
        className,
        children,
    } = props;

    return (
        <div
            className={classNames("responsive-layout", className)}
            data-direction={resolveDirection(props, "base")}
            data-direction-xs={resolveDirection(props, "xs")}
            data-direction-s={resolveDirection(props, "s")}
            data-direction-m={resolveDirection(props, "m")}
            data-direction-l={resolveDirection(props, "l")}

            data-align={resolveAlignment(props, "base")}
            data-align-xs={resolveAlignment(props, "xs")}
            data-align-s={resolveAlignment(props, "s")}
            data-align-m={resolveAlignment(props, "m")}
            data-align-l={resolveAlignment(props, "l")}

            data-spacing={resolveSpacing(props, "base")}
            data-spacing-xs={resolveSpacing(props, "xs")}
            data-spacing-s={resolveSpacing(props, "s")}
            data-spacing-m={resolveSpacing(props, "m")}
            data-spacing-l={resolveSpacing(props, "l")}

            data-padding={resolvePadding(props, "base")}
            data-padding-xs={resolvePadding(props, "xs")}
            data-padding-s={resolvePadding(props, "s")}
            data-padding-m={resolvePadding(props, "m")}
            data-padding-l={resolvePadding(props, "l")}
        >
            {children}
        </div>
    );
}

type Breakpoint = "base" | "xs" | "s" | "m" | "l"

function resolveDirection(props: ResponsiveLayoutProps, breakpoint: Breakpoint): Direction | undefined {
    if (typeof props.direction === "object") return props.direction[breakpoint];
    if (typeof props.direction === "string") return props.direction;
    if (props.leftToRight) return "left-to-right";
    if (props.rightToLeft) return "right-to-left";
    if (props.topToBottom) return "top-to-bottom";
    if (props.bottomToTop) return "bottom-to-top";
    return undefined;
}

function resolveAlignment(props: ResponsiveLayoutProps, breakpoint: Breakpoint): Alignment | undefined {
    if (typeof props.alignment === "object") return props.alignment[breakpoint];
    if (typeof props.alignment === "string") return props.alignment;
    if (props.center) return "center";
    if (props.topCenter) return "top-center";
    if (props.topLeft) return "top-left";
    if (props.topRight) return "top-right";
    if (props.bottomCenter) return "bottom-center";
    if (props.bottomLeft) return "bottom-left";
    if (props.bottomRight) return "bottom-right";
    if (props.centerLeft) return "center-left";
    if (props.centerRight) return "center-right";
    if (props.left) return "left";
    if (props.right) return "right";
    if (props.top) return "top";
    if (props.bottom) return "bottom";
    return undefined;
}

function resolveSpacing(props: ResponsiveLayoutProps, breakpoint: Breakpoint): Spacing | undefined {
    if (typeof props.spacing === "object") return props.spacing[breakpoint];
    if (typeof props.spacing === "string") return props.spacing;
    if (props.spacing3xl) return "3xl";
    if (props.spacing2xl) return "2xl";
    if (props.spacingXl) return "xl";
    if (props.spacingL) return "l";
    if (props.spacingM) return "m";
    if (props.spacingS) return "s";
    if (props.spacingXs) return "xs";
    if (props.spacing2xs) return "2xs";
    if (props.spacing3xs) return "3xs";
    return undefined;
}

function resolvePadding(props: ResponsiveLayoutProps, breakpoint: Breakpoint): Spacing | undefined {
    if (typeof props.padding === "object") return props.padding[breakpoint];
    if (typeof props.padding === "string") return props.padding;
    if (props.padding3xl) return "3xl";
    if (props.padding2xl) return "2xl";
    if (props.paddingXl) return "xl";
    if (props.paddingL) return "l";
    if (props.paddingM) return "m";
    if (props.paddingS) return "s";
    if (props.paddingXs) return "xs";
    if (props.padding2xs) return "2xs";
    if (props.padding3xs) return "3xs";
    return undefined;
}