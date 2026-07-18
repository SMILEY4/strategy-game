import {useWindowStore} from "@modules/uicomponents/window/window-store.ts";
import type {CSSProperties, ReactNode} from "react";
import {CssValueUtils} from "@modules/utilities/css-value.ts";

interface UseWindowFrameData {
    elementProps: {
        style: CSSProperties;
    },
    isBlocked: boolean,
    content: ReactNode
    bringToFront: () => void
}

export function useWindowFrame(windowId: string): UseWindowFrameData {

    const window = useWindowStore(state => state.windowData.find(it => it.windowId === windowId));

    const isBlocked = useWindowStore(state =>
        state.windowData
            .filter(it => it.blockOthers)
            .map(it => it.windowId)
            .filter(it => it !== windowId)
            .length > 0,
    );

    const bringToFront = useWindowStore(state => state.bringToFront);

    if (!window) {
        throw new Error("Could not find window with id " + windowId);
    }

    return {
        elementProps: {
            style: {
                zIndex: window.stackIndex * 10,
                left: CssValueUtils.format(window.position.left),
                right: CssValueUtils.format(window.position.right),
                top: CssValueUtils.format(window.position.top),
                bottom: CssValueUtils.format(window.position.bottom),
                width: CssValueUtils.format(window.position.width),
                height: CssValueUtils.format(window.position.height),
                transform: window.position.transform ? window.position.transform : undefined,
            },
        },
        isBlocked: isBlocked,
        content: window.content,
        bringToFront: () => bringToFront(windowId)
    }
}