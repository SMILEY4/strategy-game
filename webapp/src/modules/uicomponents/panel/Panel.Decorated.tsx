import type {ComponentPropsWithoutRef, CSSProperties, ReactElement} from "react";
import classNames from "classnames";
import styles from "./panel.decorated.module.less";
import {assertExhaustive} from "@modules/utilities/assert-exhaustive.ts";


type Border =
    | "none"
    | "metal"
    | "line"
    | "ornamental"
    | "metal-ornament"

type BorderShorthands = {
    noBorder?: boolean;
    metalBorder?: boolean;
    lineBorder?: boolean;
    ornamentalBorder?: boolean;
    metalOrnamentBorder?: boolean;
};

type Corner =
    | "sharp"
    | "rounded"

type CornerShorthands = {
    sharpCorner?: boolean;
    roundedCorner?: boolean;
}

type Pattern =
    | "none"
    | "paper"
    | "ornament"

type PatternShorthands = {
    noPattern?: boolean;
    paperPattern?: boolean;
    ornamentPattern?: boolean;
};

type Variant =
    | "neutral"
    | "blue"
    | "red"
    | "green"
    | "purple"
    | "yellow"
    | "orange"
    | "teal"
    | "bronze"

type VariantShorthands = {
    neutral?: boolean
    blue?: boolean
    red?: boolean
    green?: boolean
    purple?: boolean
    yellow?: boolean
    orange?: boolean
    teal?: boolean
    bronze?: boolean
};

type SizeShorthands = {
    fillWidth?: boolean;
    fillHeight?: boolean;
    fillParent?: boolean;
}

type ColorOverlay = {
    color: string;
    direction: "top" | "bottom" | "left" | "right" | "fill";
}

type ImageOverlay = {
    url: string;
    direction: "top" | "bottom" | "left" | "right" | "fill";
}

type Overlay = ColorOverlay | ImageOverlay;

export type Panel_DecoratedProps = {
        border?: Border;
        corner?: Corner;
        pattern?: Pattern;
        variant?: Variant;
        overlay?: Overlay
    }
    & ComponentPropsWithoutRef<"div">
    & BorderShorthands
    & CornerShorthands
    & PatternShorthands
    & VariantShorthands
    & SizeShorthands

export function Panel_Decorated(props: Panel_DecoratedProps): ReactElement {

    const {
        className,
        children,

        // border
        border,
        noBorder,
        ornamentalBorder,
        metalBorder,
        lineBorder,
        metalOrnamentBorder,

        // corner
        corner,
        sharpCorner,
        roundedCorner,

        // pattern
        pattern,
        noPattern,
        paperPattern,
        ornamentPattern,

        // variant
        variant,
        neutral,
        blue,
        red,
        green,
        purple,
        yellow,
        orange,
        teal,
        bronze,

        // size
        fillWidth,
        fillHeight,
        fillParent,

        // overlay
        overlay,

        // everything else
        ...rest
    } = props;

    const borderResolved = resolveBorder({border, noBorder, ornamentalBorder, metalBorder, lineBorder, metalOrnamentBorder});
    const cornerResolved = resolveCorner({corner, sharpCorner, roundedCorner});
    const patternResolved = resolvePattern({pattern, noPattern, paperPattern, ornamentPattern});
    const variantResolved = resolveVariant({variant, neutral, blue, red, green, purple, yellow, orange, teal, bronze});
    const sizeXResolved = resolveSizeX({fillParent, fillWidth, fillHeight});
    const sizeYResolved = resolveSizeY({fillParent, fillWidth, fillHeight});
    const overlayType = determineOverlayType(overlay);

    return (
        <div
            {...rest}
            className={classNames(styles.panel, styles["panel--decorated"], className)}
            data-border={borderResolved}
            data-corner={cornerResolved}
            data-pattern={patternResolved}
            data-variant={variantResolved}
            data-size-x={sizeXResolved}
            data-size-y={sizeYResolved}
        >
            <div className={styles["panel--decorated__base"]}/>
            {overlay && (
                <div
                    className={styles["panel--decorated__overlay"]}
                    style={{
                        ...(overlayType === "color" ? buildColorOverlayStyle(overlay as ColorOverlay) : {}),
                        ...(overlayType === "image" ? buildImageOverlayStyle(overlay as ImageOverlay) : {}),
                    }}
                />
            )}
            {patternResolved !== "none" && (
                <div className={styles["panel--decorated__texture"]}/>
            )}
            {(borderResolved !== "none" && borderResolved !== "metal") && (
                <div className={styles["panel--decorated__decoration"]}/>
            )}
            <div className={styles["panel--decorated__content"]}>
                {children}
            </div>
        </div>
    );
}

function buildImageOverlayStyle(gradient: ImageOverlay): CSSProperties {
    if (gradient.direction === "fill") {
        return {
            backgroundImage: `url('${gradient.url}')`,
        };
    } else {
        return {
            maskImage: `linear-gradient(${buildGradientAngle(gradient)}, transparent 15%, black 100%)`,
            backgroundImage: `url('${gradient.url}')`,
        };
    }
}


function buildColorOverlayStyle(gradient: ColorOverlay): CSSProperties {
    if (gradient.direction === "fill") {
        return {
            backgroundColor: gradient.color,
        };
    } else {
        return {
            background: `linear-gradient(${buildGradientAngle(gradient)}, transparent 15%, ${gradient.color} 100%)`,
        };
    }
}

function buildGradientAngle(gradient: Overlay): string {
    if (gradient.direction === "top") return "0deg";
    if (gradient.direction === "right") return "90deg";
    if (gradient.direction === "bottom") return "180deg";
    if (gradient.direction === "left") return "270deg";
    if (gradient.direction === "fill") return "";
    assertExhaustive(gradient.direction);
}

function resolveBorder(props: { border?: Border } & BorderShorthands): Border {
    if (props.border) return props.border;
    if (props.noBorder) return "none";
    if (props.ornamentalBorder) return "ornamental";
    if (props.metalBorder) return "metal";
    if (props.lineBorder) return "line";
    if (props.metalOrnamentBorder) return "metal-ornament";
    return "line";
}

function resolveCorner(props: { corner?: Corner } & CornerShorthands): Corner | undefined {
    if (props.corner) return props.corner;
    if (props.sharpCorner) return "sharp";
    if (props.roundedCorner) return "rounded";
    return undefined;
}

function resolvePattern(props: { pattern?: Pattern } & PatternShorthands): Pattern {
    if (props.pattern) return props.pattern;
    if (props.noPattern) return "none";
    if (props.paperPattern) return "paper";
    if (props.ornamentPattern) return "ornament";
    return "paper";
}


function resolveVariant(props: { variant?: Variant } & VariantShorthands): Variant {
    if (props.variant) return props.variant;
    if (props.neutral) return "neutral";
    if (props.blue) return "blue";
    if (props.red) return "red";
    if (props.green) return "green";
    if (props.purple) return "purple";
    if (props.yellow) return "yellow";
    if (props.orange) return "orange";
    if (props.teal) return "teal";
    if (props.bronze) return "bronze";
    return "neutral";
}

function determineOverlayType(gradient?: Overlay): "image" | "color" | undefined {
    if (!gradient) return undefined;
    if ("color" in gradient) return "color";
    if ("url" in gradient) return "image";
    assertExhaustive(gradient);
}

function resolveSizeX(props: SizeShorthands): boolean | undefined {
    if (props.fillParent) return true;
    if (props.fillWidth) return true;
    return undefined;
}

function resolveSizeY(props: SizeShorthands): boolean | undefined {
    if (props.fillParent) return true;
    if (props.fillHeight) return true;
    return undefined;
}