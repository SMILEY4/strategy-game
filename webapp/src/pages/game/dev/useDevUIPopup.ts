import {useCallback, useEffect, useRef, useState} from "react";

function copyStyles(target: Document): void {
    for (const node of document.head.querySelectorAll("style, link[rel='stylesheet']")) {
        target.head.appendChild(node.cloneNode(true));
    }
}

export function useDevUIPopup() {
    const [root, setRoot] = useState<HTMLElement | null>(null);
    const popupRef = useRef<Window | null>(null);

    const clearPopup = useCallback(() => {
        popupRef.current = null;
        setRoot(null);
    }, []);

    const close = useCallback(() => {
        popupRef.current?.close();
        clearPopup();
    }, [clearPopup]);

    const open = useCallback(() => {
        const popup = window.open("", "strategy-game-developer-ui", "popup=yes,width=520,height=760,resizable=yes");
        if (!popup) return;

        popup.document.title = "Developer UI";
        popup.document.body.replaceChildren();
        popup.document.body.style.cssText = "height: 100vh; margin: 0; overflow: hidden;";
        copyStyles(popup.document);

        const popupRoot = popup.document.createElement("div");
        popupRoot.className = "dev-ui-popout-root";
        popupRoot.style.height = "100%";
        popup.document.body.appendChild(popupRoot);
        popupRef.current = popup;
        popup.addEventListener("beforeunload", clearPopup, {once: true});
        setRoot(popupRoot);
    }, [clearPopup]);

    useEffect(() => close, [close]);

    return {root, open, close};
}
