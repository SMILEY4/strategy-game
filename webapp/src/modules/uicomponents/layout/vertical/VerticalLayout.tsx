import classNames from "classnames";
import type {ComponentPropsWithRef, ReactElement} from "react";
import styles from "./verticalLayout.module.less";

type VerticalAlign =
    | "start"
    | "end"
    | "center"
    | "space-around"
    | "space-between"
    | "space-evenly"

type VerticalAlignShorthands = {
    verticalStart?: boolean;
    verticalEnd?: boolean;
    verticalCenter?: boolean;
    verticalSpaceAround?: boolean;
    verticalSpaceBetween?: boolean;
    verticalSpaceEvenly?: boolean;
};

type HorizontalAlign =
    | "left"
    | "right"
    | "center"
    | "stretch"

type HorizontalAlignShorthands = {
    horizontalLeft?: boolean;
    horizontalRight?: boolean;
    horizontalCenter?: boolean;
    horizontalStretch?: boolean;
};

type Direction =
    | "top-to-bottom"
    | "bottom-to-top"

type DirectionShorthands = {
    topToBottom?: boolean;
    bottomToTop?: boolean;
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
    | "3xl"

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

export type VerticalLayoutProps = {
        verticalAlign?: VerticalAlign;
        horizontalAlign?: HorizontalAlign;
        center?: boolean,
        direction?: Direction;
        spacing?: Spacing;
        padding?: Spacing;
        scrollable?: boolean;
        fillWidth?: boolean;
        fillHeight?: boolean;
    }
    & ComponentPropsWithRef<"div">
    & VerticalAlignShorthands
    & HorizontalAlignShorthands
    & DirectionShorthands
    & SpacingShorthands
    & PaddingShorthands

export function VerticalLayout(props: VerticalLayoutProps): ReactElement {

    const {
        className,
        children,

        // vertical align
        verticalAlign,
        verticalStart,
        verticalEnd,
        verticalCenter,
        verticalSpaceAround,
        verticalSpaceBetween,
        verticalSpaceEvenly,

        // horizontal align
        horizontalAlign,
        horizontalLeft,
        horizontalRight,
        horizontalCenter,
        horizontalStretch,

        // align both
        center,

        // direction
        direction,
        topToBottom,
        bottomToTop,

        // spacing
        spacing,
        spacing3xs,
        spacing2xs,
        spacingXs,
        spacingS,
        spacingM,
        spacingL,
        spacingXl,
        spacing2xl,
        spacing3xl,

        // padding
        padding,
        padding3xs,
        padding2xs,
        paddingXs,
        paddingS,
        paddingM,
        paddingL,
        paddingXl,
        padding2xl,
        padding3xl,

        // scrollable
        scrollable,

        // fill
        fillWidth,
        fillHeight,

        // everything else is safe for <div />
        ...rest
    } = props;

    const verticalAlignResolved = resolveVerticalAlign({
        verticalAlign,
        verticalStart,
        verticalEnd,
        verticalCenter,
        verticalSpaceAround,
        verticalSpaceBetween,
        verticalSpaceEvenly,
        center
    });

    const horizontalAlignResolved = resolveHorizontalAlign({
        horizontalAlign,
        horizontalLeft,
        horizontalRight,
        horizontalCenter,
        horizontalStretch,
        center
    });

    const directionResolved = resolveDirection({
        direction,
        topToBottom,
        bottomToTop,
    });

    const spacingResolved = resolveSpacing({
        spacing,
        spacing3xs,
        spacing2xs,
        spacingXs,
        spacingS,
        spacingM,
        spacingL,
        spacingXl,
        spacing2xl,
        spacing3xl,
    });

    const paddingResolved = resolvePadding({
        padding,
        padding3xs,
        padding2xs,
        paddingXs,
        paddingS,
        paddingM,
        paddingL,
        paddingXl,
        padding2xl,
        padding3xl,
    });

    return (
        <div
            {...rest}
            className={classNames(styles["vertical-layout"], className)}
            data-align-vertical={verticalAlignResolved}
            data-align-horizontal={horizontalAlignResolved}
            data-direction={directionResolved}
            data-spacing={spacingResolved}
            data-padding={paddingResolved}
            data-scrollable={scrollable ? "" : undefined}
            data-fill-width={fillWidth ? "" : undefined}
            data-fill-height={fillHeight ? "" : undefined}
        >
            {children}
        </div>
    );
}

function resolveVerticalAlign(props: VerticalLayoutProps & { center?: boolean}): VerticalAlign | undefined {
    if (props.verticalAlign) return props.verticalAlign;
    if (props.verticalCenter) return "center";
    if (props.verticalEnd) return "end";
    if (props.verticalSpaceAround) return "space-around";
    if (props.verticalSpaceBetween) return "space-between";
    if (props.verticalSpaceEvenly) return "space-evenly";
    if (props.verticalStart) return "start";
    if (props.center) return "center";
    return undefined;
}

function resolveHorizontalAlign(props: VerticalLayoutProps & { center?: boolean}): HorizontalAlign | undefined {
    if (props.horizontalAlign) return props.horizontalAlign;
    if (props.horizontalLeft) return "left";
    if (props.horizontalRight) return "right";
    if (props.horizontalCenter) return "center";
    if (props.horizontalStretch) return "stretch";
    if (props.center) return "center";
    return undefined;
}

function resolveDirection(props: VerticalLayoutProps): Direction | undefined {
    if (props.direction) return props.direction;
    if (props.bottomToTop) return "bottom-to-top";
    if (props.topToBottom) return "top-to-bottom";
    return undefined;
}


function resolveSpacing(input: VerticalLayoutProps): Spacing | undefined {
    if (input.spacing) return input.spacing;
    if (input.spacing3xl) return "3xl";
    if (input.spacing2xl) return "2xl";
    if (input.spacingXl) return "xl";
    if (input.spacingL) return "l";
    if (input.spacingM) return "m";
    if (input.spacingS) return "s";
    if (input.spacingXs) return "xs";
    if (input.spacing2xs) return "2xs";
    if (input.spacing3xs) return "3xs";
    return undefined;
}

function resolvePadding(input: VerticalLayoutProps): Spacing | undefined {
    if (input.padding) return input.padding;
    if (input.padding3xl) return "3xl";
    if (input.padding2xl) return "2xl";
    if (input.paddingXl) return "xl";
    if (input.paddingL) return "l";
    if (input.paddingM) return "m";
    if (input.paddingS) return "s";
    if (input.paddingXs) return "xs";
    if (input.padding2xs) return "2xs";
    if (input.padding3xs) return "3xs";
    return undefined;
}