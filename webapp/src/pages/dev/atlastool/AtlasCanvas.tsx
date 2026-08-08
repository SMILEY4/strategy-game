import {type ReactElement, type RefObject, useEffect, useRef, useState} from "react";
import type {AtlasEditor} from "@pages/dev/atlastool/app/atlas.editor.ts";
import {useAtlasCanvas} from "@pages/dev/atlastool/app/useAtlasCanvas.ts";

export function AtlasCanvas(props: AtlasEditor<true> & { canvasRef?: RefObject<HTMLCanvasElement | null> }): ReactElement {

    const {
        canvasRef,
        onPointerDown,
        onPointerMove,
        onPointerUp,
        onPointerCancel,
        onPointerLeave,
        onMouseDown,
        onAuxClick,
        onWheel,
        render,
    } = useAtlasCanvas(props, props.canvasRef);

    const containerRef = useRef<HTMLDivElement>(null);
    const statusRef = useRef<HTMLSpanElement>(null);

    const [, setSizeTick] = useState(0);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) {
            return;
        }
        const observer = new ResizeObserver(() => setSizeTick(value => value + 1));
        observer.observe(container);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) {
            return;
        }
        canvas.addEventListener("wheel", onWheel, {passive: false});
        return () => canvas.removeEventListener("wheel", onWheel);
    }, [onWheel, canvasRef]);

    useEffect(() => {
        render();
    });

    return (
        <div ref={containerRef} className="atlas-canvas">
            <canvas
                className="atlas-canvas__surface"
                ref={canvasRef}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerCancel}
                onPointerLeave={onPointerLeave}
                onMouseDown={onMouseDown}
                onAuxClick={onAuxClick}
            />
            <div className="atlas-canvas__status">
                <span ref={statusRef}/>
            </div>
        </div>
    );
}
