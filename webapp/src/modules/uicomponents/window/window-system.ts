import {assertExhaustive} from "@modules/utilities/assert-exhaustive.ts";
import {type CssValue, CssValueUtils} from "@modules/utilities/css-value.ts";
import type {ReactNode} from "react";

export interface WindowProperties {
    id?: string,
    groupId?: string,
    anchor: string,
    blockOthers?: boolean
    preferredHeight?: CssValue,
    preferredWidth?: CssValue,
    content: (windowId: string) => ReactNode,
}

export interface WindowData {
    windowId: string,
    groupId: string,
    stackIndex: number,
    isPinned: boolean,
    content: ReactNode,
    blockOthers: boolean,
    position: WindowPosition
}

export interface WindowPosition {
    top: CssValue | null,
    bottom: CssValue | null,
    left: CssValue | null,
    right: CssValue | null,
    width: CssValue | null,
    height: CssValue | null,
    transform: string | null
}

export type WindowAnchor =
    | WindowPointAnchor
    | WindowVerticalLineAnchor
    | WindowHorizontalLineAnchor
    | WindowAreaAnchor

interface WindowAnchorBase {
    id: string,
    type: string
}

/**
 * Specific point on the screen as an anchor.
 * - either "top" OR "bottom" must be set
 * - either "left" OR "right" must be set
 */
interface WindowPointAnchor extends WindowAnchorBase {
    id: string,
    type: "point"
    top: CssValue | null,
    bottom: CssValue | null,
    left: CssValue | null,
    right: CssValue | null,
    side: "centered" | "above" | "below" | "left" | "right"
}

/**
 * A vertical line with given height as an anchor
 * - either "left" OR "right" must be set
 * - "top" AND "bottom" must be set
 */
interface WindowVerticalLineAnchor extends WindowAnchorBase {
    id: string,
    type: "line-vertical"
    top: CssValue,
    bottom: CssValue,
    left: CssValue | null,
    right: CssValue | null,
    side: "left" | "right"

}

/**
 * A vertical line with given height as an anchor
 * - either "top" OR "bottom" must be set
 * - "left" AND "right" must be set
 */
interface WindowHorizontalLineAnchor extends WindowAnchorBase {
    id: string,
    type: "line-horizontal"
    left: CssValue,
    right: CssValue,
    top: CssValue | null,
    bottom: CssValue | null,
    side: "top" | "bottom"
}

/**
 * An area with fixed position and size as an anchor
 * - either "top" OR "bottom" must be set
 * - either "left" OR "right" must be set
 * - "width" AND "height" must be set
 */
interface WindowAreaAnchor extends WindowAnchorBase {
    id: string,
    type: "area"
    top: CssValue | null,
    bottom: CssValue | null,
    left: CssValue | null,
    right: CssValue | null,
    width: CssValue,
    height: CssValue,
}

export const WINDOW_STACK_ID = "window-stack";

export const ANCHOR_LEFT_SIDE = "left-side";
export const ANCHOR_RIGHT_SIDE = "right-side";
export const ANCHOR_CENTER_POINT = "center-point";
export const ANCHOR_BOTTOM_POINT = "bottom-point";


export const windowSystem = {

    availableAnchors: [
        {
            id: ANCHOR_LEFT_SIDE,
            type: "area",
            top: CssValueUtils.px(10),
            bottom: CssValueUtils.px(10),
            left: CssValueUtils.px(10),
            right: CssValueUtils.percentage(70),
        } as WindowAreaAnchor,
        {
            id: ANCHOR_RIGHT_SIDE,
            type: "area",
            top: CssValueUtils.px(10),
            bottom: CssValueUtils.px(10),
            right: CssValueUtils.px(10),
            left: CssValueUtils.percentage(70),
        } as WindowAreaAnchor,
        {
            id: ANCHOR_CENTER_POINT,
            type: "point",
            top: CssValueUtils.percentage(50),
            left: CssValueUtils.percentage(50),
            bottom: null,
            right: null,
            side: "centered",
        } as WindowPointAnchor,
        {
            id: ANCHOR_BOTTOM_POINT,
            type: "point",
            left: CssValueUtils.percentage(50),
            bottom: CssValueUtils.px(10),
            top: null,
            right: null,
            autoMargin: true,
            side: "above",
        } as WindowPointAnchor,
    ] satisfies WindowAnchor[],


    createInitialWindowData: (properties: WindowProperties, availableAnchors: WindowAnchor[]): WindowData => {

        function calculateWindowPosition(properties: WindowProperties, anchor: WindowAnchor): WindowPosition {
            if (anchor.type === "point") {
                if (anchor.side === "centered") {
                    return {
                        top: anchor.top,
                        bottom: anchor.bottom,
                        left: anchor.left,
                        right: anchor.right,
                        width: properties.preferredWidth ? properties.preferredWidth : null,
                        height: properties.preferredWidth ? properties.preferredWidth : null,
                        transform: "translate(-50%, -50%)",
                    };
                }
                if (anchor.side === "above") {
                    return {
                        top: null,
                        bottom: anchor.bottom,
                        left: anchor.left,
                        right: anchor.right,
                        width: properties.preferredWidth ? properties.preferredWidth : null,
                        height: properties.preferredWidth ? properties.preferredWidth : null,
                        transform: "translate(-50%, 0)",
                    };
                }
                if (anchor.side === "below") {
                    return {
                        top: anchor.top,
                        bottom: null,
                        left: anchor.left,
                        right: anchor.right,
                        width: properties.preferredWidth ? properties.preferredWidth : null,
                        height: properties.preferredWidth ? properties.preferredWidth : null,
                        transform: "translate(-50%, 0)",
                    };
                }
                if (anchor.side === "left") {
                    return {
                        top: anchor.top,
                        bottom: anchor.bottom,
                        left: null,
                        right: anchor.right,
                        width: properties.preferredWidth ? properties.preferredWidth : null,
                        height: properties.preferredWidth ? properties.preferredWidth : null,
                        transform: "translate(0, -50%)",
                    };
                }
                if (anchor.side === "right") {
                    return {
                        top: anchor.top,
                        bottom: anchor.bottom,
                        left: anchor.left,
                        right: null,
                        width: properties.preferredWidth ? properties.preferredWidth : null,
                        height: properties.preferredWidth ? properties.preferredWidth : null,
                        transform: "translate(0, -50%)",
                    };
                }
                assertExhaustive(anchor.side);
            }
            if (anchor.type === "line-vertical") {
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
                }
                if (anchor.side === "right") {
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
                assertExhaustive(anchor.side);
            }
            if (anchor.type === "line-horizontal") {
                if (anchor.side === "top") {
                    return {
                        top: null,
                        bottom: anchor.top ?? anchor.bottom,
                        left: anchor.left,
                        right: anchor.right,
                        width: null,
                        height: null,
                        transform: null,
                    };
                }
                if (anchor.side === "bottom") {
                    return {
                        top: anchor.top ?? anchor.bottom,
                        bottom: null,
                        left: anchor.left,
                        right: anchor.right,
                        width: null,
                        height: null,
                        transform: null,
                    };
                }
                assertExhaustive(anchor.side);
            }
            if (anchor.type === "area") {
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
            assertExhaustive(anchor);
        }

        const anchor = availableAnchors.find(it => it.id === properties.anchor);
        if (!anchor) {
            throw new Error("Could not find anchor " + properties.anchor);
        }

        const position = calculateWindowPosition(properties, anchor);

        const windowId = properties.id ? properties.id : crypto.randomUUID()

        return {
            windowId: windowId,
            groupId: properties.groupId ? properties.groupId : crypto.randomUUID(),
            stackIndex: 999999,
            isPinned: false,
            blockOthers: properties.blockOthers === true,
            content: properties.content(windowId),
            position: position,
        };
    },

    recalculateStackIndices: (windows: WindowData[]): void => {
        windows.sort((a, b) => a.stackIndex - b.stackIndex);
        windows.forEach((it, index) => it.stackIndex = index);
    }

};