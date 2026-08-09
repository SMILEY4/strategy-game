import {type ReactElement, type RefObject, useEffect, useRef, useState} from "react";
import type {AtlasEditor} from "@pages/dev/atlastool/app/atlas.editor.ts";
import {useAtlasCanvas} from "@pages/dev/atlastool/app/useAtlasCanvas.ts";

/** Formats a coordinate as a UV value (0..1) relative to the given dimension. */
function toUv(value: number, max: number): string {
    return (max > 0 ? value / max : 0).toFixed(3);
}

export function AtlasCanvas(props: AtlasEditor<true> & { canvasRef?: RefObject<HTMLCanvasElement | null> }): ReactElement {

    const {
        cursorPoint,
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
                {cursorPoint && (
                    <>
                        <span>{Math.round(cursorPoint.x)}, {Math.round(cursorPoint.y)} px</span>
                        <span>u {toUv(cursorPoint.x, props.project.image.size.width)} · v {toUv(cursorPoint.y, props.project.image.size.height)}</span>
                    </>
                )}
                <span>{props.project.viewport.value.zoom.toFixed(2)}×</span>
                <span>{props.project.tool.available.find(tool => tool.id === props.project.tool.active)?.displayName ?? props.project.tool.active}</span>
                {props.project.sprites.selected && (
                    <span>{props.project.sprites.selected.name} · {props.project.sprites.selected.width}×{props.project.sprites.selected.height}</span>
                )}
            </div>
        </div>
    );
}
