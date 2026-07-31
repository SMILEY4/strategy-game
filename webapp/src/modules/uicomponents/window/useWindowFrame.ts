import {useWindowStore} from "@modules/uicomponents/window/window-store.ts";
import {type CSSProperties, type ReactNode, useCallback, useMemo} from "react";
import {CssValueUtils} from "@modules/utilities/css-value.ts";
import {useShallow} from "zustand/react/shallow";

interface UseWindowFrameData {
    elementProps: {
        style: CSSProperties;
    };
    isBlocked: boolean;
    content: ReactNode;
    bringToFront: () => void;
}

export function useWindowFrame(windowId: string): UseWindowFrameData {

    const {window, isBlocked} = useWindowStore(
        useShallow(state => ({
            window: state.windowData.find(it => it.windowId === windowId),
            isBlocked: state.windowData
                .filter(it => it.blockOthers)
                .some(it => it.windowId !== windowId),
        })),
    );

    const bringToFront = useWindowStore(state => state.bringToFront);

    if (!window) {
        throw new Error("Could not find window with id " + windowId);
    }

    const style = useMemo<CSSProperties>(() => ({
        zIndex: window.stackIndex * 10,
        left: CssValueUtils.format(window.position.left),
        right: CssValueUtils.format(window.position.right),
        top: CssValueUtils.format(window.position.top),
        bottom: CssValueUtils.format(window.position.bottom),
        width: CssValueUtils.format(window.position.width),
        height: CssValueUtils.format(window.position.height),
        transform: window.position.transform ?? undefined,
    }), [window]);

    const handleBringToFront = useCallback(() => {
        bringToFront(windowId);
    }, [bringToFront, windowId]);

    return {
        elementProps: {style},
        isBlocked: isBlocked,
        content: window.content,
        bringToFront: handleBringToFront,
    };
}