import {useCallback, useMemo, useState} from "react";

export interface HoverData {
    elementProps: {
        onPointerEnter: () => void;
        onPointerLeave: () => void;
    },
    elementDataAttributes: {
        "data-hovered": string | undefined
    }
    isHovered: boolean;
}

export function useHover(onChange?: (hover: boolean) => void): HoverData {

    const [isHovered, setHovered] = useState(false);

    const handlePointerEnter = useCallback(() => {
        setHovered(true);
        onChange?.(true);
    }, [onChange]);

    const handlePointerLeave = useCallback(() => {
        setHovered(false);
        onChange?.(false);
    }, [onChange]);

    const elementProps = useMemo(
        () => ({
            onPointerEnter: handlePointerEnter,
            onPointerLeave: handlePointerLeave,
        }),
        [handlePointerEnter, handlePointerLeave],
    );

    const elementDataAttributes = useMemo(
        () => ({
            "data-hovered": isHovered ? "" : undefined,
        }),
        [isHovered],
    );

    return {
        elementProps,
        elementDataAttributes,
        isHovered,
    };
}