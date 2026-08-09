import {type ReactElement, type RefObject, useRef} from "react";
import classNames from "classnames";
import type {AtlasTool} from "./app/atlas.types.ts";
import {MAX_ZOOM, MIN_ZOOM, ZOOM_LEVEL_STEP, zoomToLevel} from "./app/atlas.geometry.ts";
import {readFileAsText} from "@pages/dev/atlastool/app/atlas.io.ts";
import {TOOL_HOTKEYS} from "./app/useAtlasShortcuts.ts";
import styles from "./AtlasToolbar.module.less";
import {RedoIcon, ToolIconDraw, ToolIconPan, ToolIconSelect, UndoIcon, ViewIconFit} from "@pages/dev/atlastool/atlas.icons.tsx";
import type {AtlasEditorProject} from "@pages/dev/atlastool/app/useAtlasEditor.ts";

export function AtlasToolbar(props: AtlasEditorProject & { canvasRef?: RefObject<HTMLCanvasElement | null> }): ReactElement {
    return (
        <header className={styles.toolbar}>
            <ProjectActions {...props}/>
            <HistoryControls {...props}/>
            <ToolIconGroup {...props}/>
            <ZoomControl {...props}/>
            <ViewportControls {...props}/>
            <AtlasNameInput {...props}/>
        </header>
    );
}

function ProjectActions(props: AtlasEditorProject) {
    const inputJsonRef = useRef<HTMLInputElement>(null);

    async function loadProjectFile(file: File) {
        try {
            const text = await readFileAsText(file);
            props.atlas.load(text);
        } catch (error) {
            window.alert(error instanceof Error ? error.message : "Could not load JSON");
        }
    }

    return (
        <>
            <button type="button" onClick={() => inputJsonRef.current?.click()}>Load JSON</button>
            <button type="button" onClick={props.export}>Export JSON</button>

            <input
                ref={inputJsonRef}
                type="file"
                accept=".json,application/json"
                hidden
                onChange={event => {
                    const file = event.target.files?.[0];
                    if (file) {
                        void loadProjectFile(file);
                    }
                    event.target.value = "";
                }}
            />
        </>
    );
}

function HistoryControls(props: AtlasEditorProject) {
    return (
        <div className={styles.history} role="group" aria-label="History">
            <button
                type="button"
                className={styles.historyButton}
                onClick={props.history.undo}
                disabled={!props.history.canUndo}
                title="Undo"
                aria-label="Undo"
            >
                <UndoIcon/>
            </button>
            <button
                type="button"
                className={styles.historyButton}
                onClick={props.history.redo}
                disabled={!props.history.canRedo}
                title="Redo"
                aria-label="Redo"
            >
                <RedoIcon/>
            </button>
        </div>
    );
}

const TOOL_ICONS: Record<AtlasTool, () => ReactElement> = {
    Select: ToolIconSelect,
    Draw: ToolIconDraw,
    Pan: ToolIconPan,
};

function ToolIconGroup(props: AtlasEditorProject) {
    const tools: AtlasTool[] = ["Select", "Draw", "Pan"];
    return (
        <div className={styles.tools} role="group" aria-label="Tool">
            {tools.map(tool => {
                const Icon = TOOL_ICONS[tool];
                const active = props.tool.active === tool;
                return (
                    <button
                        key={tool}
                        type="button"
                        className={classNames(styles.toolButton, active && styles.toolButtonActive)}
                        title={`${tool} (${TOOL_HOTKEYS[tool]})`}
                        aria-pressed={active}
                        onClick={() => props.tool.select(tool)}
                    >
                        <Icon/>
                    </button>
                );
            })}
        </div>
    );
}

function ZoomControl(props: AtlasEditorProject & { canvasRef?: RefObject<HTMLCanvasElement | null> }) {
    return (
        <div className={styles.zoom}>
            <button
                type="button"
                onClick={props.viewport.zoomOut}
                title="Zoom out"
            >
                −
            </button>
            <input
                type="range"
                min={zoomToLevel(MIN_ZOOM)}
                max={zoomToLevel(MAX_ZOOM)}
                step={ZOOM_LEVEL_STEP}
                value={props.viewport.value.zoomLevel}
                onChange={event => props.viewport.setZoomLevel(Number(event.target.value))}
                onKeyDown={event => event.stopPropagation()}
            />
            <button
                type="button"
                onClick={props.viewport.zoomIn}
                title="Zoom in"
            >
                +
            </button>
            <span className={styles.zoomValue}>{props.viewport.value.zoom.toFixed(2)}×</span>
        </div>
    );
}

function ViewportControls(props: AtlasEditorProject & { canvasRef?: RefObject<HTMLCanvasElement | null> }) {
    return (
        <div className={styles.view}>
            <button
                type="button"
                className={styles.viewButton}
                onClick={props.viewport.fit}
                title="Fit image to view"
                aria-label="Fit image to view"
            >
                <ViewIconFit/>
            </button>
        </div>
    );
}

function AtlasNameInput(props: AtlasEditorProject) {
    return (
        <label className={styles.field}>
            Atlas name
            <input
                value={props.atlas.name}
                onChange={event => props.atlas.updateName(event.target.value)}
                onKeyDown={event => event.stopPropagation()}
            />
        </label>
    );
}
