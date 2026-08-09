import {type ReactElement, type RefObject, useRef} from "react";
import classNames from "classnames";
import type {AtlasTool} from "./app/atlas.types.ts";
import {fitViewport, MAX_ZOOM, MIN_ZOOM, ZOOM_LEVEL_STEP, zoomAt, zoomFromLevel, zoomToLevel} from "./app/atlas.geometry.ts";
import type {AtlasEditor} from "@pages/dev/atlastool/app/atlas.editor.ts";
import {readFileAsText} from "@pages/dev/atlastool/app/atlas.io.ts";
import {TOOL_HOTKEYS} from "./app/useAtlasShortcuts.ts";
import {INITIAL_VIEWPORT} from "@pages/dev/atlastool/app/useAtlasEditor.ts";
import styles from "./AtlasToolbar.module.less";
import {ToolIconDraw, ToolIconPan, ToolIconSelect, ViewIconFit, ViewIconReset} from "@pages/dev/atlastool/atlas.icons.tsx";

export function AtlasToolbar(props: AtlasEditor<true> & { canvasRef?: RefObject<HTMLCanvasElement | null> }): ReactElement {
    return (
        <header className={styles.toolbar}>
            <ProjectActions {...props}/>
            <ToolIconGroup {...props}/>
            <ZoomControl {...props}/>
            <ViewportControls {...props}/>
            <AtlasNameInput {...props}/>
        </header>
    );
}

function ProjectActions(props: AtlasEditor<true>) {
    const inputImageRef = useRef<HTMLInputElement>(null);
    const inputJsonRef = useRef<HTMLInputElement>(null);

    function openImageFile(file: File) {
        void props.load.image(file);
    }

    async function loadProjectFile(file: File) {
        const text = await readFileAsText(file);
        try {
            props.load.projectJson(text);
        } catch (error) {
            window.alert(error instanceof Error ? error.message : "Could not load JSON");
        }
    }

    return (
        <>
            <button type="button" onClick={() => inputImageRef.current?.click()}>Replace image</button>
            <button type="button" onClick={() => inputJsonRef.current?.click()}>Load JSON</button>
            <button type="button" onClick={props.project.export.projectJson}>Export JSON</button>

            <input
                ref={inputImageRef}
                type="file"
                accept="image/*" // todo: also load jsons ???
                hidden
                onChange={event => {
                    const file = event.target.files?.[0];
                    if (file) {
                        openImageFile(file);
                    }
                    event.target.value = "";
                }}
            />

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

const TOOL_ICONS: Record<AtlasTool, () => ReactElement> = {
    select: ToolIconSelect,
    draw: ToolIconDraw,
    pan: ToolIconPan,
};

function ToolIconGroup(props: AtlasEditor<true>) {
    return (
        <div className={styles.tools} role="group" aria-label="Tool">
            {props.project.tool.available.map(tool => {
                const Icon = TOOL_ICONS[tool.id];
                const active = props.project.tool.active === tool.id;
                return (
                    <button
                        key={tool.id}
                        type="button"
                        className={classNames(styles.toolButton, active && styles.toolButtonActive)}
                        title={`${tool.displayName} (${TOOL_HOTKEYS[tool.id]})`}
                        aria-pressed={active}
                        onClick={() => props.project.tool.select(tool.id)}
                    >
                        <Icon/>
                    </button>
                );
            })}
        </div>
    );
}

function ZoomControl(props: AtlasEditor<true> & { canvasRef?: RefObject<HTMLCanvasElement | null> }) {

    function setViewportZoom(nextZoom: number) {
        const rect = props.canvasRef?.current?.getBoundingClientRect();
        const anchor = rect ? {x: rect.width / 2, y: rect.height / 2} : {x: 0, y: 0};
        props.project.viewport.set(zoomAt(props.project.viewport.value, anchor, nextZoom));
    }

    return (
        <div className={styles.zoom}>
            <button
                type="button"
                onClick={() => setViewportZoom(zoomFromLevel(zoomToLevel(props.project.viewport.value.zoom) - 0.5))}
                title="Zoom out"
            >
                −
            </button>
            <input
                type="range"
                min={zoomToLevel(MIN_ZOOM)}
                max={zoomToLevel(MAX_ZOOM)}
                step={ZOOM_LEVEL_STEP}
                value={zoomToLevel(props.project.viewport.value.zoom)}
                onChange={event => setViewportZoom(zoomFromLevel(Number(event.target.value)))}
                onKeyDown={event => event.stopPropagation()}
            />
            <button
                type="button"
                onClick={() => setViewportZoom(zoomFromLevel(zoomToLevel(props.project.viewport.value.zoom) + 0.5))}
                title="Zoom in"
            >
                +
            </button>
            <span className={styles.zoomValue}>{props.project.viewport.value.zoom.toFixed(2)}×</span>
        </div>
    );
}

function ViewportControls(props: AtlasEditor<true> & { canvasRef?: RefObject<HTMLCanvasElement | null> }) {

    function fitView() {
        const rect = props.canvasRef?.current?.getBoundingClientRect();
        if (!rect) {
            return;
        }
        props.project.viewport.set(fitViewport({width: rect.width, height: rect.height}, props.project.image.size));
    }

    function resetView() {
        props.project.viewport.set({...INITIAL_VIEWPORT});
    }

    return (
        <div className={styles.view}>
            <button type="button" className={styles.viewButton} onClick={fitView} title="Fit image to view" aria-label="Fit image to view">
                <ViewIconFit/>
            </button>
            <button type="button" className={styles.viewButton} onClick={resetView} title="Reset view" aria-label="Reset view">
                <ViewIconReset/>
            </button>
        </div>
    );
}

function AtlasNameInput(props: AtlasEditor<true>) {
    return (
        <label className={styles.field}>
            Atlas name
            <input
                value={props.project.atlasName.value}
                onChange={event => props.project.atlasName.set(event.target.value)}
                onKeyDown={event => event.stopPropagation()}
            />
        </label>
    );
}
