import classNames from "classnames";
import type {ComponentPropsWithoutRef, ReactElement} from "react";
import styles from "./horizontalLayout.module.less";

type HorizontalAlign =
    | "start"
    | "end"
    | "center"
    | "space-around"
    | "space-between"
    | "space-evenly";

type HorizontalAlignShorthands = {
    horizontalStart?: boolean;
    horizontalEnd?: boolean;
    horizontalCenter?: boolean;
    horizontalSpaceAround?: boolean;
    horizontalSpaceBetween?: boolean;
    horizontalSpaceEvenly?: boolean;
};

type VerticalAlign =
    | "top"
    | "bottom"
    | "center"
    | "stretch";

type VerticalAlignShorthands = {
    verticalTop?: boolean;
    verticalBottom?: boolean;
    verticalCenter?: boolean;
    verticalStretch?: boolean;
};

type Direction =
    | "left-to-right"
    | "right-to-left";

type DirectionShorthands = {
    leftToRight?: boolean;
    rightToLeft?: boolean;
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

export type HorizontalLayoutProps = {
        horizontalAlign?: HorizontalAlign;
        verticalAlign?: VerticalAlign;
        center?: boolean,
        direction?: Direction;
        spacing?: Spacing;
        padding?: Spacing;
        scrollable?: boolean;
    }
    & ComponentPropsWithoutRef<"div">
    & HorizontalAlignShorthands
    & VerticalAlignShorthands
    & DirectionShorthands
    & SpacingShorthands
    & PaddingShorthands;

export function HorizontalLayout(props: HorizontalLayoutProps): ReactElement {

    const {
        className,
        children,

        // horizontal align
        horizontalAlign,
        horizontalStart,
        horizontalEnd,
        horizontalCenter,
        horizontalSpaceAround,
        horizontalSpaceBetween,
        horizontalSpaceEvenly,

        // vertical align
        verticalAlign,
        verticalTop,
        verticalBottom,
        verticalCenter,
        verticalStretch,

        // align both
        center,

        // direction
        direction,
        leftToRight,
        rightToLeft,

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

        // everything else
        ...rest
    } = props;

    const horizontalAlignResolved = resolveHorizontalAlign({
        horizontalAlign,
        horizontalStart,
        horizontalEnd,
        horizontalCenter,
        horizontalSpaceAround,
        horizontalSpaceBetween,
        horizontalSpaceEvenly,
        center,
    });

    const verticalAlignResolved = resolveVerticalAlign({
        verticalAlign,
        verticalTop,
        verticalBottom,
        verticalCenter,
        verticalStretch,
        center,
    });

    const directionResolved = resolveDirection({
        direction,
        leftToRight,
        rightToLeft,
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
            className={classNames(styles["horizontal-layout"], className)}
            data-align-horizontal={horizontalAlignResolved}
            data-align-vertical={verticalAlignResolved}
            data-direction={directionResolved}
            data-spacing={spacingResolved}
            data-padding={paddingResolved}
            data-scrollable={scrollable ? "" : undefined}
        >
            {children}
        </div>
    );
}

function resolveHorizontalAlign(props: HorizontalLayoutProps & { center?: boolean }): HorizontalAlign | undefined {
    if (props.horizontalAlign) return props.horizontalAlign;
    if (props.horizontalCenter) return "center";
    if (props.horizontalEnd) return "end";
    if (props.horizontalSpaceAround) return "space-around";
    if (props.horizontalSpaceBetween) return "space-between";
    if (props.horizontalSpaceEvenly) return "space-evenly";
    if (props.horizontalStart) return "start";
    if (props.center) return "center";
    return undefined;
}

function resolveVerticalAlign(props: HorizontalLayoutProps & { center?: boolean }): VerticalAlign | undefined {
    if (props.verticalAlign) return props.verticalAlign;
    if (props.verticalTop) return "top";
    if (props.verticalBottom) return "bottom";
    if (props.verticalCenter) return "center";
    if (props.verticalStretch) return "stretch";
    if (props.center) return "center";
    return undefined;
}

function resolveDirection(props: HorizontalLayoutProps): Direction | undefined {
    if (props.direction) return props.direction;
    if (props.rightToLeft) return "right-to-left";
    if (props.leftToRight) return "left-to-right";
    return undefined;
}

function resolveSpacing(props: HorizontalLayoutProps): Spacing | undefined {
    if (props.spacing) return props.spacing;
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

function resolvePadding(input: HorizontalLayoutProps): Spacing | undefined {
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