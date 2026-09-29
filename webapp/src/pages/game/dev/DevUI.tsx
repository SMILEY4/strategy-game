import {createPortal} from "react-dom";
import {useEffect, useRef, useState, type PointerEvent as ReactPointerEvent} from "react";
import "./dev-ui.less";

const DEFAULT_WIDTH = 360;
const MIN_WIDTH = 280;

function clampWidth(width: number): number {
    return Math.max(MIN_WIDTH, Math.min(width, Math.min(720, window.innerWidth * 0.7)));
}

function copyStyles(source: Document, target: Document): void {
    for (const node of source.head.querySelectorAll("style, link[rel='stylesheet']")) {
        target.head.appendChild(node.cloneNode(true));
    }
}

interface DevUIContentProps {
    onClose: () => void;
    onPopOut: () => void;
    onResizeStart: (event: ReactPointerEvent<HTMLDivElement>) => void;
    isPoppedOut: boolean;
}

function DevUIContent(props: DevUIContentProps) {
    return (
        <aside
            className="dev-ui-sidebar"
            style={props.isPoppedOut ? undefined : {width: "100%"}}
            aria-label="Developer UI"
        >
            <header className="dev-ui-header">
                <div>
                    <span className="dev-ui-kicker">Developer tools</span>
                    <h2>Developer UI</h2>
                </div>
                <div className="dev-ui-actions">
                    {!props.isPoppedOut && (
                        <button type="button" onClick={props.onPopOut} aria-label="Pop out developer UI">
                            Pop out
                        </button>
                    )}
                    <button type="button" onClick={props.onClose} aria-label="Close developer UI">
                        Close
                    </button>
                </div>
            </header>
            <div className="dev-ui-content">
                <p>Developer tools will be added here.</p>
            </div>
            {!props.isPoppedOut && (
                <div
                    className="dev-ui-resize-handle"
                    onPointerDown={props.onResizeStart}
                    role="separator"
                    aria-label="Resize developer UI"
                    aria-orientation="vertical"
                />
            )}
        </aside>
    );
}

export function DevUI() {
    const [isOpen, setIsOpen] = useState(false);
    const [width, setWidth] = useState(DEFAULT_WIDTH);
    const [popupRoot, setPopupRoot] = useState<HTMLElement | null>(null);
    const popupRef = useRef<Window | null>(null);

    const isPoppedOut = popupRoot !== null;

    useEffect(() => {
        function handleResize(): void {
            setWidth(current => clampWidth(current));
        }

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        if (!popupRef.current) return;

        const popup = popupRef.current;
        const interval = window.setInterval(() => {
            if (popup.closed) {
                popupRef.current = null;
                setPopupRoot(null);
            }
        }, 250);

        return () => window.clearInterval(interval);
    }, [popupRoot]);

    useEffect(() => {
        return () => popupRef.current?.close();
    }, []);

    function closePopup(): void {
        popupRef.current?.close();
        popupRef.current = null;
        setPopupRoot(null);
    }

    function openPopup(): void {
        const popup = window.open(
            "",
            "strategy-game-developer-ui",
            "popup=yes,width=520,height=760,resizable=yes,scrollbars=yes",
        );
        if (!popup) return;

        popup.document.title = "Developer UI";
        popup.document.body.replaceChildren();
        popup.document.body.style.margin = "0";
        popup.document.body.style.height = "100vh";
        popup.document.body.style.minWidth = "280px";
        popup.document.body.style.overflow = "hidden";
        copyStyles(document, popup.document);

        const root = popup.document.createElement("div");
        root.className = "dev-ui-popout-root";
        root.style.height = "100%";
        popup.document.body.appendChild(root);
        popupRef.current = popup;
        setPopupRoot(root);
    }

    function handleResizeStart(event: ReactPointerEvent<HTMLDivElement>): void {
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        const startX = event.clientX;
        const startWidth = width;

        function handlePointerMove(moveEvent: PointerEvent): void {
            setWidth(clampWidth(startWidth + moveEvent.clientX - startX));
        }

        function handlePointerUp(): void {
            window.removeEventListener("pointermove", handlePointerMove);
            window.removeEventListener("pointerup", handlePointerUp);
        }

        window.addEventListener("pointermove", handlePointerMove);
        window.addEventListener("pointerup", handlePointerUp, {once: true});
    }

    const content = (
        <DevUIContent
            onClose={() => {
                closePopup();
                setIsOpen(false);
            }}
            onPopOut={isPoppedOut ? () => undefined : openPopup}
            onResizeStart={handleResizeStart}
            isPoppedOut={isPoppedOut}
        />
    );

    return (
        <div
            className="dev-ui-host"
            style={{width: isOpen && !isPoppedOut ? `${width}px` : 0}}
        >
            {!isOpen && !isPoppedOut && (
                <button
                    className="dev-ui-toggle"
                    type="button"
                    onClick={() => setIsOpen(true)}
                    aria-label="Open developer UI"
                    aria-expanded={false}
                >
                    DEV
                </button>
            )}
            {isOpen && !isPoppedOut && content}
            {popupRoot && createPortal(content, popupRoot)}
        </div>
    );
}
