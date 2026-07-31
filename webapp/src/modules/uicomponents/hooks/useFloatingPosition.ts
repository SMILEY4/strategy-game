import useResizeObserver from "@react-hook/resize-observer";
import {type RefObject, useCallback, useEffect, useLayoutEffect, useRef, useState} from "react";

export interface FloatingPositionData {
    x: number,
    y: number,
    maxWidth: number | undefined,
    maxHeight: number | undefined,
    preferredWidth: number | undefined,
    preferredHeight: number | undefined
    arrowSize: number | undefined,
    arrowX: number | undefined,
    arrowY: number | undefined
    placement: "top" | "bottom" | "left" | "right"
}

export interface FloatingPositionOptions {
    enabled: boolean,
    container?: HTMLElement,
    referenceRef: RefObject<HTMLElement | null>,
    floatingRef: RefObject<HTMLElement | null>,
    viewport: "window" | "clipping-parent"
    placement?: {
        primary?: "top" | "bottom" | "left" | "right",
        secondary?: "start" | "center" | "end",
    },
    size?: {
        maxSize: number | undefined,
        useAvailable: boolean,
        matchSecondary: boolean,
    },
    shift?: {
        primary: boolean,
        secondary: boolean,
    },
    flip?: {
        enabled: boolean,
        bestFit?: boolean,
    },
    arrow?: {
        size: number
    }
}

export function useFloatingPosition(options: FloatingPositionOptions): FloatingPositionData {

    // the positioning for the floating element
    const [position, setPosition] = useState<FloatingPositionData>({
        x: 0,
        y: 0,
        maxWidth: undefined,
        maxHeight: undefined,
        preferredWidth: undefined,
        preferredHeight: undefined,
        arrowSize: undefined,
        arrowX: undefined,
        arrowY: undefined,
        placement: "top",
    });

    // reference to the animation handler
    const animationRef = useRef<number>(0);

    // update the position of the popup element
    const computePosition = useCallback(() => {

        // get referenced elements
        const elementReference = options.referenceRef.current;
        const elementFloating = options.floatingRef.current;
        if (!elementReference || !elementFloating) return;

        const elementClipping = getClippingParent(elementReference);

        // get complete configuration
        const placement = {
            primary: options.placement?.primary ?? "bottom",
            secondary: options.placement?.secondary ?? "start",
        };

        const size = {
            useAvailable: options.size?.useAvailable ?? false,
            matchSecondary: options.size?.matchSecondary ?? false,
            maxSize: options.size?.maxSize ?? undefined,
        };

        const shift = {
            primary: options.shift?.primary ?? false,
            secondary: options.shift?.secondary ?? false,
        };

        const flip = {
            enabled: options.flip?.enabled ?? false,
            bestFit: options.flip?.bestFit ?? (size.useAvailable),
        };

        const arrow = {
            enabled: options.arrow?.size !== undefined,
            size: options.arrow?.size ?? 0,
        };

        // get element bounding rectangles
        const rectReference = boundingRectFromElement(elementReference);
        const rectFloating = boundingRectFromElement(elementFloating);
        const rectBoundary = (elementClipping !== null && options.viewport === "clipping-parent")
            ? boundingRectFromElement(elementClipping)
            : boundingRectFromWindow();

        // initial values
        let floatingData: FloatingBoundingRect = {
            primary: placement.primary,
            secondary: placement.secondary,
            x: rectFloating.x,
            y: rectFloating.y,
            width: rectFloating.width,
            height: rectFloating.height,
            preferredWidth: undefined,
            preferredHeight: undefined,
            maxWidth: undefined,
            maxHeight: undefined,
        };
        let arrowData: ArrowBoundingRect | null = null;

        // initial positioning
        floatingData = calculatePosition(floatingData, rectReference, rectFloating);

        // flip
        if (flip.enabled) {
            floatingData = calculateFlip(floatingData, flip.bestFit, rectReference, rectFloating, rectBoundary);
        }

        // size
        if (size.useAvailable) {
            floatingData = calculateUseAvailable(floatingData, rectReference, rectBoundary);
        }
        if (size.maxSize) {
            floatingData = calculateMaxSize(floatingData, size.maxSize);
        }
        if (size.matchSecondary) {
            floatingData = calculateMatchSecondary(floatingData, rectReference);
        }

        // shift
        if (shift.primary || shift.secondary) {
            floatingData = calculateShift(floatingData, shift.primary, shift.secondary, rectFloating, rectBoundary);
        }

        // arrow
        if (arrow.enabled) {
            arrowData = calculateArrow(floatingData, arrow.size, rectReference, rectBoundary);
        }

        setPosition({
            placement: floatingData.primary,
            x: floatingData.x,
            y: floatingData.y,
            preferredWidth: floatingData.preferredWidth,
            preferredHeight: floatingData.preferredHeight,
            maxWidth: floatingData.maxWidth,
            maxHeight: floatingData.maxHeight,
            arrowSize: arrowData?.sideLength,
            arrowX: arrowData?.x,
            arrowY: arrowData?.y,
        });

    }, [
        options.arrow?.size,
        options.flip?.bestFit,
        options.flip?.enabled,
        options.floatingRef,
        options.placement?.primary,
        options.placement?.secondary,
        options.referenceRef,
        options.shift?.primary,
        options.shift?.secondary,
        options.size?.useAvailable,
        options.size?.matchSecondary,
        options.size?.maxSize,
        options.viewport
    ]);

    // proxy for computePosition, throttled using animation frames.
    const computePositionThrottled = useCallback(() => {
        if (animationRef.current) return;
        animationRef.current = requestAnimationFrame(() => {
            animationRef.current = 0;
            computePosition();
        });
    }, [computePosition]);

    // position the popup element on re-render
    useLayoutEffect(() => {
        if (!options.enabled) return;
        computePosition();
    }, [options.enabled, computePosition]);

    // re-compute position on scroll
    useEffect(() => {
        if (!options.enabled) return;
        window.addEventListener("scroll", computePositionThrottled, {capture: true, passive: true});
        window.addEventListener("resize", computePositionThrottled, {passive: true});
        return () => {
            window.removeEventListener("scroll", computePositionThrottled, {capture: true});
            window.removeEventListener("resize", computePositionThrottled);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
                animationRef.current = 0;
            }
        };
    }, [options.enabled, options.size, computePositionThrottled]);

    // re-compute position on element resize
    useResizeObserver(options.referenceRef.current, computePositionThrottled);
    useResizeObserver(options.floatingRef.current, computePositionThrottled);

    return position;
}

interface BoundingRect {
    x: number,
    y: number,
    width: number,
    height: number,
}

function boundingRectFromWindow(): BoundingRect {
    return {
        x: 0,
        y: 0,
        width: window.innerWidth,
        height: window.innerHeight,
    };
}

function boundingRectFromElement(element: HTMLElement): BoundingRect {
    const rect = element.getBoundingClientRect();
    return {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
    };
}

function getClippingParent(element: HTMLElement | null): HTMLElement | null {
    if (!element) return null;

    const overflowRegex = /(auto|scroll|overlay)/;

    let parent: HTMLElement | null = element.parentElement;

    while (parent) {
        const style = getComputedStyle(parent);
        if (
            overflowRegex.test(style.overflow + style.overflowX + style.overflowY)
        ) {
            return parent;
        }

        if (style.clipPath && style.clipPath !== "none") {
            return parent;
        }

        parent = parent.parentElement;
    }

    return null;
}

function getAvailableSpace(primary: "top" | "bottom" | "left" | "right", rectReference: BoundingRect, rectBoundary: BoundingRect): number {

    let availableSpace = 0;

    switch (primary) {
        case "top": {
            availableSpace = rectReference.y - rectBoundary.y;
            break;
        }
        case "bottom": {
            availableSpace = rectBoundary.height - ((rectReference.y) + rectReference.height) + rectBoundary.y;
            break;
        }
        case "left": {
            availableSpace = rectReference.x - rectBoundary.x;
            break;
        }
        case "right": {
            availableSpace = rectBoundary.width - (rectReference.x + rectReference.width) + rectBoundary.x;
            break;
        }
    }

    return availableSpace;
}

interface FloatingBoundingRect {
    primary: "top" | "bottom" | "left" | "right",
    secondary: "start" | "center" | "end"
    x: number;
    y: number,
    width: number,
    height: number,
    preferredWidth: number | undefined,
    preferredHeight: number | undefined
    maxWidth: number | undefined,
    maxHeight: number | undefined
}

interface ArrowBoundingRect {
    primary: "top" | "bottom" | "left" | "right",
    x: number;
    y: number,
    sideLength: number,
}

function calculatePosition(
    data: FloatingBoundingRect,
    rectReference: BoundingRect,
    rectFloating: BoundingRect,
): FloatingBoundingRect {

    const newData: FloatingBoundingRect = {
        ...data,
    };

    switch (data.primary) {
        case "top": {
            newData.y = rectReference.y - rectFloating.height;
            switch (data.secondary) {
                case "start": {
                    newData.x = rectReference.x;
                    break;
                }
                case "center": {
                    newData.x = (rectReference.x + rectReference.width / 2) - (rectFloating.width / 2);
                    break;
                }
                case "end": {
                    newData.x = rectReference.x + (rectReference.width - rectFloating.width);
                    break;
                }
            }
            break;
        }
        case "bottom": {
            newData.y = rectReference.y + rectReference.height;
            switch (data.secondary) {
                case "start": {
                    newData.x = rectReference.x;
                    break;
                }
                case "center": {
                    newData.x = (rectReference.x + rectReference.width / 2) - (rectFloating.width / 2);
                    break;
                }
                case "end": {
                    newData.x = rectReference.x + (rectReference.width - rectFloating.width);
                    break;
                }
            }
            break;
        }
        case "left": {
            newData.x = rectReference.x - rectFloating.width;
            switch (data.secondary) {
                case "start": {
                    newData.y = rectReference.y;
                    break;
                }
                case "center": {
                    newData.y = (rectReference.y + rectReference.height / 2) - (rectFloating.height / 2);
                    break;
                }
                case "end": {
                    newData.y = rectReference.y + (rectReference.height - rectFloating.height);
                    break;
                }
            }
            break;
        }
        case "right": {
            newData.x = rectReference.x + rectReference.width;
            switch (data.secondary) {
                case "start": {
                    newData.y = rectReference.y;
                    break;
                }
                case "center": {
                    newData.y = (rectReference.y + rectReference.height / 2) - (rectFloating.height / 2);
                    break;
                }
                case "end": {
                    newData.y = rectReference.y + (rectReference.height - rectFloating.height);
                    break;
                }
            }
            break;
        }
    }

    return newData;
}


function calculateFlip(
    data: FloatingBoundingRect,
    bestFit: boolean,
    rectReference: BoundingRect,
    rectFloating: BoundingRect,
    rectBounding: BoundingRect,
): FloatingBoundingRect {

    let shouldFlipTo: "top" | "bottom" | "left" | "right" | null = null;

    switch (data.primary) {
        case "top": {
            if (bestFit) {
                const spaceTop = getAvailableSpace("top", rectReference, rectBounding);
                const spaceBottom = getAvailableSpace("bottom", rectReference, rectBounding);
                shouldFlipTo = spaceTop > spaceBottom ? "top" : "bottom";
            } else {
                shouldFlipTo = (data.y < rectBounding.y) ? "bottom" : null;
            }
            break;
        }
        case "bottom": {
            if (bestFit) {
                const spaceTop = getAvailableSpace("top", rectReference, rectBounding);
                const spaceBottom = getAvailableSpace("bottom", rectReference, rectBounding);
                shouldFlipTo = spaceTop > spaceBottom ? "top" : "bottom";
            } else {
                shouldFlipTo = (rectBounding.y + rectBounding.height < data.y + rectFloating.height) ? "top" : null;
            }
            break;
        }
        case "left": {
            if (bestFit) {
                const spaceLeft = getAvailableSpace("left", rectReference, rectBounding);
                const spaceRight = getAvailableSpace("right", rectReference, rectBounding);
                shouldFlipTo = spaceLeft > spaceRight ? "left" : "right";
            } else {
                shouldFlipTo = (data.x < rectBounding.x) ? "right" : null;
            }
            break;
        }
        case "right": {
            if (bestFit) {
                const spaceLeft = getAvailableSpace("left", rectReference, rectBounding);
                const spaceRight = getAvailableSpace("right", rectReference, rectBounding);
                shouldFlipTo = spaceLeft > spaceRight ? "left" : "right";
            } else {
                shouldFlipTo = (rectBounding.x + rectBounding.width < data.x + rectFloating.width) ? "left" : null;
            }
            break;
        }
    }

    if (shouldFlipTo != null) {
        return calculatePosition(
            {
                ...data,
                primary: shouldFlipTo,
            },
            rectReference, rectFloating);
    } else {
        return data;
    }

}


function calculateUseAvailable(
    data: FloatingBoundingRect,
    rectReference: BoundingRect,
    rectBoundary: BoundingRect,
): FloatingBoundingRect {

    const availableSpace = getAvailableSpace(data.primary, rectReference, rectBoundary);

    let maxWidth = undefined;
    let maxHeight = undefined;

    switch (data.primary) {
        case "top":
        case "bottom": {
            maxHeight = Math.max(0, availableSpace);
            break;
        }
        case "left":
        case "right": {
            maxWidth = Math.max(0, availableSpace);
            break;
        }
    }
    return {
        ...data,
        maxWidth: maxWidth,
        maxHeight: maxHeight,
    };
}


function calculateMaxSize(
    data: FloatingBoundingRect,
    maxSize: number,
): FloatingBoundingRect {

    const newData: FloatingBoundingRect = {
        ...data,
    };

    switch (data.primary) {
        case "top":
        case "bottom": {
            newData.maxHeight = newData.maxHeight
                ? Math.min(newData.maxHeight, maxSize)
                : maxSize;
            break;
        }
        case "left":
        case "right": {
            newData.maxWidth = newData.maxWidth
                ? Math.min(newData.maxWidth, maxSize)
                : maxSize;
            break;
        }
    }

    return newData;
}

function calculateMatchSecondary(
    data: FloatingBoundingRect,
    rectReference: BoundingRect,
): FloatingBoundingRect {

    let width = undefined;
    let height = undefined;

    switch (data.primary) {
        case "top":
        case "bottom": {
            width = rectReference.width;
            break;
        }
        case "left":
        case "right": {
            height = rectReference.height;
            break;
        }
    }

    return {
        ...data,
        maxWidth: width,
        maxHeight: height,
        preferredWidth: width,
        preferredHeight: height,
    };
}


function calculateShift(
    data: FloatingBoundingRect,
    shiftPrimary: boolean,
    shiftSecondary: boolean,
    rectFloating: BoundingRect,
    rectBoundary: BoundingRect,
): FloatingBoundingRect {

    const newData: FloatingBoundingRect = {
        ...data,
    };

    switch (data.primary) {
        case "top":
        case "bottom": {
            if (shiftPrimary) {
                newData.y = Math.max(rectBoundary.y, newData.y);
                newData.y = Math.min(rectBoundary.y + rectBoundary.height - rectFloating.height, newData.y);
            }
            if (shiftSecondary) {
                newData.x = Math.max(rectBoundary.x, newData.x);
                newData.x = Math.min(rectBoundary.x + rectBoundary.width - rectFloating.width, newData.x);
            }
            break;
        }
        case "left":
        case "right": {
            if (shiftPrimary) {
                newData.x = Math.max(rectBoundary.x, newData.x);
                newData.x = Math.min(rectBoundary.x + rectBoundary.width - rectFloating.width, newData.x);
            }
            if (shiftSecondary) {
                newData.y = Math.max(rectBoundary.y, newData.y);
                newData.y = Math.min(rectBoundary.y + rectBoundary.height - rectFloating.height, newData.y);
            }
            break;
        }
    }

    return newData;
}


function calculateArrow(
    data: FloatingBoundingRect,
    arrowSize: number,
    rectReference: BoundingRect,
    rectBoundary: BoundingRect,
): ArrowBoundingRect {

    const arrowData: ArrowBoundingRect = {
        primary: data.primary,
        x: 0,
        y: 0,
        sideLength: arrowSize,
    };


    // initial position
    switch (data.primary) {
        case "top": {
            arrowData.x = rectReference.x + (rectReference.width / 2) - (arrowSize / 2);
            arrowData.y = data.y + data.height - arrowSize;
            break;
        }
        case "bottom": {
            arrowData.x = rectReference.x + (rectReference.width / 2) - (arrowSize / 2);
            arrowData.y = data.y;
            break;
        }
        case "left": {
            arrowData.x = data.x + data.width - arrowSize;
            arrowData.y = rectReference.y + (rectReference.height / 2) - (arrowSize / 2);
            break;
        }
        case "right": {
            arrowData.x = data.x;
            arrowData.y = rectReference.y + (rectReference.height / 2) - (arrowSize / 2);
            break;
        }
    }

    // clamp to floating element
    switch (arrowData.primary) {
        case "top":
        case "bottom": {
            arrowData.x = Math.max(arrowData.x, data.x + arrowSize / 2);
            arrowData.x = Math.min(arrowData.x, data.x + data.width - arrowSize * 2);

            arrowData.y = Math.max(arrowData.y, rectBoundary.y - arrowSize / 2);
            arrowData.y = Math.min(arrowData.y, rectBoundary.y + rectBoundary.height - arrowSize);
            break;
        }
        case "left":
        case "right": {
            arrowData.x = Math.max(arrowData.x, rectBoundary.x - arrowSize / 2);
            arrowData.x = Math.min(arrowData.x, rectBoundary.x + rectBoundary.width - arrowSize);
            arrowData.y = Math.max(arrowData.y, data.y + arrowSize / 2);
            arrowData.y = Math.min(arrowData.y, data.y + data.height - arrowSize * 2);
            break;
        }
    }

    return arrowData;
}