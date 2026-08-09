import {type ReactElement, type RefObject} from "react";
import type {AtlasEditor} from "@pages/dev/atlastool/app/atlas.editor.ts";
import {useAtlasCanvas} from "@pages/dev/atlastool/app/useAtlasCanvas.ts";
import styles from "./AtlasCanvas.module.less";

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
        <div ref={containerRef} className={styles.canvas}>
            <canvas
                className={styles.surface}
                ref={canvasRef}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerCancel}
                onPointerLeave={onPointerLeave}
                onMouseDown={onMouseDown}
                onAuxClick={onAuxClick}
            />
            <div className={styles.status}>
                {cursorPoint && (
                    <span>{Math.round(cursorPoint.x)}, {Math.round(cursorPoint.y)} px</span>
                )}
                {props.project.images.list.length > 1 && (
                    <span>{props.project.images.active?.name} · {props.project.images.list.findIndex(layer => layer.id === props.project.images.activeId) + 1}/{props.project.images.list.length}</span>
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