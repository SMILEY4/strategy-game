import {type ReactElement, type RefObject} from "react";
import {useAtlasCanvas} from "@pages/dev/atlastool/app/useAtlasCanvas.ts";
import styles from "./AtlasCanvas.module.less";
import type {AtlasEditorProject} from "@pages/dev/atlastool/app/useAtlasEditor.ts";

export function AtlasCanvas(props: AtlasEditorProject & { canvasRef?: RefObject<HTMLCanvasElement | null> }): ReactElement {

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
                <span>{props.layers.active?.name}</span>
                <span>{props.viewport.value.zoom.toFixed(2)}×</span>
                <span>{props.tool.active}</span>
                {props.sprites.selected.length > 0 && (
                    <span>
                        {props.sprites.selected.length > 1
                            ? `${props.sprites.selected.length} selected`
                            : props.sprites.selected[0].name}
                    </span>
                )}
            </div>
        </div>
    );
}