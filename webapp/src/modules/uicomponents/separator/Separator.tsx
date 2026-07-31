import type {ComponentPropsWithRef, ReactElement} from "react";
import classNames from "classnames";
import styles from "./separator.module.less";

type Direction = "vertical" | "horizontal";

type DirectionShorthands = {
    vertical?: boolean;
    horizontal?: boolean;
}

type Variant = "invisible" | "line"

type VariantShorthands = {
    invisible?: boolean;
    line?: boolean;
}

type Size = "none" | "3xs" | "2xs" | "xs" | "s" | "m" | "l" | "xl" | "2xl" | "3xl"

type SizeShorthands = {
    none?: boolean;
    size3xs?: boolean;
    size2xs?: boolean;
    sizeXs?: boolean;
    sizeS?: boolean;
    sizeM?: boolean;
    sizeL?: boolean;
    sizeXl?: boolean;
    size2xl?: boolean;
    size3xl?: boolean;
}

export type SeparatorProps = {
    direction?: Direction,
    variant?: Variant,
    size?: Size,
} & DirectionShorthands
    & VariantShorthands
    & SizeShorthands
    & Omit<ComponentPropsWithRef<"div">, "children">

export function Separator(props: SeparatorProps): ReactElement {

    const {
        className,

        // direction
        direction,
        vertical,
        horizontal,

        // variant
        variant,
        invisible,
        line,

        // size
        size,
        none,
        size3xs,
        size2xs,
        sizeXs,
        sizeS,
        sizeM,
        sizeL,
        sizeXl,
        size2xl,
        size3xl,

        ...rest
    } = props;

    const directionResolved = resolveDirection({
        direction, vertical, horizontal,
    });

    const variantResolved = resolveVariant({
        variant, invisible, line,
    });

    const sizeResolved = resolveSize({
        size, none, size3xs, size2xs, sizeXs, sizeS, sizeM, sizeL, sizeXl, size2xl, size3xl,
    });

    return (
        <div
            {...rest}
            className={classNames(styles.separator, className)}
            data-direction={directionResolved}
            data-variant={variantResolved}
            data-size={sizeResolved}
            role={"separator"}
            aria-orientation={directionResolved === "vertical" ? "vertical" : "horizontal"}
        />
    );
}

function resolveDirection(input: { direction?: Direction } & DirectionShorthands): Direction {
    if (input.direction) return input.direction;
    if (input.vertical) return "vertical";
    return "horizontal";
}

function resolveVariant(input: { variant?: Variant } & VariantShorthands): Variant {
    if (input.variant) return input.variant;
    if (input.line) return "line";
    return "invisible";
}

function resolveSize(input: { size?: Size } & SizeShorthands): Size {
    if (input.size) return input.size;
    if (input.none) return "none";
    if (input.size3xs) return "3xs";
    if (input.size2xs) return "2xs";
    if (input.sizeXs) return "xs";
    if (input.sizeS) return "s";
    if (input.sizeM) return "m";
    if (input.sizeL) return "l";
    if (input.sizeXl) return "xl";
    if (input.size2xl) return "2xl";
    if (input.size3xl) return "3xl";
    return "m";
}
