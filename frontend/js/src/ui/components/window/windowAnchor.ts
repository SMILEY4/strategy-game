import {CssValue} from "./cssValue";
import {WindowPosition} from "./windowData";

export type WindowAnchorType = "point" | "line_vertical" | "line_horizontal" | "area"

export interface WindowAnchor {
    id: string,
    type: WindowAnchorType;
}

/**
 * Specific point on the screen as an anchor.
 * - either "top" OR "bottom" must be set
 * - either "left" OR "right" must be set
 */
export interface WindowPointAnchor extends WindowAnchor {
    type: "point",

    top: CssValue | null,
    bottom: CssValue | null,

    left: CssValue | null,
    right: CssValue | null,

    side: "centered" | "above" | "below" | "left" | "right"
}

export namespace WindowPointAnchor {

    export function buildPosition(anchor: WindowPointAnchor): WindowPosition {
        if (anchor.side === "centered") {
            return {
                top: anchor.top,
                bottom: anchor.bottom,
                left: anchor.left,
                right: anchor.right,
                width: null,
                height: null,
                transform: "translate(-50%, -50%)",
            };
        }
        if (anchor.side === "above") {
            return {
                top: null,
                bottom: anchor.bottom,
                left: anchor.left,
                right: anchor.right,
                width: null,
                height: null,
                transform: "translate(-50%, 0)",
            };
        }
        if (anchor.side === "below") {
            return {
                top: anchor.top,
                bottom: null,
                left: anchor.left,
                right: anchor.right,
                width: null,
                height: null,
                transform: "translate(-50%, 0)",
            };
        }
        if (anchor.side === "left") {
            return {
                top: anchor.top,
                bottom: anchor.bottom,
                left: null,
                right: anchor.right,
                width: null,
                height: null,
                transform: "translate(0, -50%)",
            };
        }
        if (anchor.side === "right") {
            return {
                top: anchor.top,
                bottom: anchor.bottom,
                left: anchor.left,
                right: null,
                width: null,
                height: null,
                transform: "translate(0, -50%)",
            };
        }
        throw new Error("Unexpected side " + anchor.side + " for point-anchor.");
    }

}

/**
 * A vertical line with given height as an anchor
 * - either "left" OR "right" must be set
 * - "top" AND "bottom" must be set
 */
export interface WindowVerticalLineAnchor extends WindowAnchor {
    type: "line_vertical"

    top: CssValue,
    bottom: CssValue,

    left: CssValue | null,
    right: CssValue | null,

    side: "left" | "right"
}

export namespace WindowVerticalLineAnchor {

    export function buildPosition(anchor: WindowVerticalLineAnchor): WindowPosition {
        if (anchor.side === "left") {
            return {
                top: anchor.top,
                bottom: anchor.bottom,
                left: null,
                right: anchor.left ?? anchor.right,
                width: null,
                height: null,
                transform: null,
            };
        } else {
            return {
                top: anchor.top,
                bottom: anchor.bottom,
                left: anchor.left ?? anchor.right,
                right: null,
                width: null,
                height: null,
                transform: null,
            };
        }
    }

}

/**
 * A vertical line with given height as an anchor
 * - either "top" OR "bottom" must be set
 * - "left" AND "right" must be set
 */
export interface WindowHorizontalLineAnchor extends WindowAnchor {
    type: "line_horizontal"

    left: CssValue,
    right: CssValue,

    top: CssValue | null,
    bottom: CssValue | null,

    side: "top" | "bottom"
}

export namespace WindowHorizontalLineAnchor {

    export function buildPosition(anchor: WindowHorizontalLineAnchor): WindowPosition {
        if (anchor.side === "top") {
            return {
                top: null,
                bottom: anchor.top ?? anchor.bottom,
                left: anchor.right,
                right: anchor.left,
                width: null,
                height: null,
                transform: null,
            };
        } else {
            return {
                top: anchor.top ?? anchor.bottom,
                bottom: null,
                left: anchor.right,
                right: anchor.left,
                width: null,
                height: null,
                transform: null,
            };
        }
    }

}

/**
 * An area with fixed position and size as an anchor
 * - either "top" OR "bottom" must be set
 * - either "left" OR "right" must be set
 * - "width" AND "height" must be set
 */
export interface WindowAreaAnchor extends WindowAnchor {
    type: "area",
    top: CssValue | null,
    bottom: CssValue | null,
    left: CssValue | null,
    right: CssValue | null,
    width: CssValue,
    height: CssValue,
}

export namespace WindowAreaAnchor {

    export function buildPosition(anchor: WindowAreaAnchor): WindowPosition {
        return {
            top: anchor.top,
            bottom: anchor.bottom,
            left: anchor.left,
            right: anchor.right,
            width: anchor.width,
            height: anchor.height,
            transform: null,
        };
    }

}