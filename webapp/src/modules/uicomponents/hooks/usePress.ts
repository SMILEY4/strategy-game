import React, {useEffect, useState} from "react";

export interface PressOptions {
    onClick?: (duration: number) => void;
    onPress?: (down: boolean) => void;
    shouldTriggerOnKeyUp?: boolean,
    disabled?: boolean;
}

export interface PressData {
    elementProps: {
        onPointerDown: () => void;
        onPointerUp: () => void;
        onPointerCancel: () => void;
        onKeyDown: (e: React.KeyboardEvent) => void;
        onKeyUp: (e: React.KeyboardEvent) => void;
    },
    elementDataAttributes: {
        "data-pressed": string | undefined
    },
    isPressed: boolean,
}

export function usePress(options: PressOptions): PressData {

    const [pressedStart, setPressedStart] = useState<number | null>(null);

    function handlePointerDown() {
        if (options.disabled) return;
        setPressedStart(Date.now());
        options.onPress?.(true);
    }

    function handlePointerUp() {
        if (pressedStart == null) return;
        const activeDuration = Date.now() - pressedStart;
        if (!options.disabled) {
            options.onClick?.(activeDuration);
        }
        setPressedStart(null);
        options.onPress?.(false);
    }

    function handlePointerCancel() {
        setPressedStart(null);
        options.onPress?.(false);
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        if (options.disabled) return;
        if (pressedStart != null) return;
        if (e.key === " " || e.key === "Enter") {
            setPressedStart(Date.now());
            options.onPress?.(true);
            if (options.shouldTriggerOnKeyUp !== true) {
                options.onClick?.(1);
            }
        }
    }

    function handleKeyUp(e: React.KeyboardEvent) {
        if (pressedStart == null) return;
        if (e.key === " " || e.key === "Enter") {
            const activeDuration = Date.now() - pressedStart;
            setPressedStart(null);
            options.onPress?.(false);
            if (!options.disabled && options.shouldTriggerOnKeyUp === true) {
                options.onClick?.(activeDuration);
            }
        }
    }

    useEffect(() => {
        if (!options.onPress) return;
        const handlePointerUp = () => options.onPress?.(false);
        window.addEventListener("pointerup", handlePointerUp);
        return () => window.removeEventListener("pointerup", handlePointerUp);
    }, [options]);

    return {
        elementProps: {
            onPointerDown: handlePointerDown,
            onPointerUp: handlePointerUp,
            onPointerCancel: handlePointerCancel,
            onKeyDown: handleKeyDown,
            onKeyUp: handleKeyUp,
        },
        elementDataAttributes: {
            "data-pressed": pressedStart != null ? "" : undefined,
        },
        isPressed: pressedStart != null,
    };
}