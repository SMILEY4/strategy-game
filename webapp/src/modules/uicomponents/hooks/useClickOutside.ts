import {type RefObject, useEffect} from "react";

export function useClickOutside(enabled: boolean, refs: RefObject<HTMLElement | null>[], action: () => void) {

    useEffect(() => {
        if (!enabled) return;

        function handleEvent(event: MouseEvent | TouchEvent) {
            for (const ref of refs) {
                const element = ref.current;
                if (element && element.contains(event.target as Node)) return;
            }
            action();
        }

        document.addEventListener("pointerdown", handleEvent, {passive: true});

        return () => {
            document.removeEventListener("pointerdown", handleEvent);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enabled, ...refs]);

}