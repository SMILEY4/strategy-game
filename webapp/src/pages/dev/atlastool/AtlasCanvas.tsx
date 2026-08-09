import {type ReactElement, type RefObject} from "react";
import type {AtlasEditor} from "@pages/dev/atlastool/app/atlas.editor.ts";
import {useAtlasCanvas} from "@pages/dev/atlastool/app/useAtlasCanvas.ts";

export function AtlasCanvas(props: AtlasEditor<true> & { canvasRef?: RefObject<HTMLCanvasElement | null> }): ReactElement {

    const {
        cursorPoint,
        canvasRef,
        containerRef,
        onPointerDown,
        onPointerMove,
        onPointerUp,
        onPointerCancel,
        onPointerLeave,
        onMouseDown,
        onAuxClick,
    } = useAtlasCanvas(props, props.canvasRef);

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
                    <span>{Math.round(cursorPoint.x)}, {Math.round(cursorPoint.y)} px</span>
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