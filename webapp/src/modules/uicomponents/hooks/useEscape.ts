import {useEffect} from "react";

export function useEscapeKey(enabled: boolean, action: () => void) {

    useEffect(() => {
        if (!enabled) return;

        function handleEvent(event: KeyboardEvent) {
            if (event.key === "Escape") {
                action();
            }
        }

        document.addEventListener("keydown", handleEvent, false);

        return () => {
            document.removeEventListener("keydown", handleEvent, false);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enabled]);

}