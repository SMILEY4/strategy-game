import {type ReactElement, type RefObject, useEffect, useRef, useState} from "react";
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
            <LayersControl {...props}/>
            <ProjectMenu {...props}/>
            <ToolIconGroup {...props}/>
            <ZoomControl {...props}/>
            <ViewportControls {...props}/>
            <AtlasNameInput {...props}/>
        </header>
    );
}

/** Lets the user view, cycle, add, and remove image layers (all same size, at least one). */
function LayersControl(props: AtlasEditor<true>) {
    const inputRef = useRef<HTMLInputElement>(null);
    const {list, activeId} = props.project.images;

    async function addImages(files: File[]) {
        if (files.length === 0) {
            return;
        }
        try {
            await props.project.images.add(files);
        } catch (error) {
            window.alert(error instanceof Error ? error.message : "Could not add image");
        }
    }

    return (
        <div className={styles.layers}>
            <span className={styles.layersLabel} title={`All layers share the same size (${props.project.images.size.width}×${props.project.images.size.height})`}>Layers</span>
            <button
                type="button"
                className={styles.layerNav}
                onClick={() => props.project.images.cycle(-1)}
                title="Previous layer ([)"
                aria-label="Previous layer"
            >
                ◀
            </button>
            <div className={styles.layerList}>
                {list.map(layer => (
                    <button
                        key={layer.id}
                        type="button"
                        className={classNames(styles.layerPill, layer.id === activeId && styles.layerPillActive)}
                        title={`${layer.name} (${layer.size.width}×${layer.size.height})`}
                        onClick={() => props.project.images.select(layer.id)}
                    >
                        {layer.name}
                    </button>
                ))}
            </div>
            <button
                type="button"
                className={styles.layerNav}
                onClick={() => props.project.images.cycle(1)}
                title="Next layer (])"
                aria-label="Next layer"
            >
                ▶
            </button>
            <button
                type="button"
                className={styles.layerAction}
                onClick={() => inputRef.current?.click()}
                title="Add image layer"
            >
                + Add
            </button>
            <button
                type="button"
                className={styles.layerAction}
                onClick={() => { if (activeId) props.project.images.remove(activeId); }}
                disabled={list.length <= 1}
                title={list.length <= 1 ? "Cannot remove the only layer" : "Remove active layer"}
            >
                − Remove
            </button>

            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={event => {
                    const selected = Array.from(event.target.files ?? []);
                    if (selected.length > 0) {
                        void addImages(selected);
                    }
                    event.target.value = "";
                }}
            />
        </div>
    );
}

/** Project-level actions: load a project JSON (replaces sprites) and export the current one. */
function ProjectMenu(props: AtlasEditor<true>) {
    const [open, setOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const inputJsonRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!open) {
            return;
        }
        const onPointerDown = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("pointerdown", onPointerDown);
        return () => document.removeEventListener("pointerdown", onPointerDown);
    }, [open]);

    async function loadProjectFile(file: File) {
        const text = await readFileAsText(file);
        try {
            props.load.projectJson(text);
        } catch (error) {
            window.alert(error instanceof Error ? error.message : "Could not load JSON");
        }
    }

    return (
        <div className={styles.menu} ref={menuRef}>
            <button
                type="button"
                className={classNames(styles.menuButton, open && styles.menuButtonOpen)}
                onClick={() => setOpen(value => !value)}
                aria-haspopup="menu"
                aria-expanded={open}
            >
                Project ▾
            </button>
            {open && (
                <div className={styles.menuItems} role="menu">
                    <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                            setOpen(false);
                            inputJsonRef.current?.click();
                        }}
                    >
                        Load project JSON…
                    </button>
                    <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                            setOpen(false);
                            props.project.export.projectJson();
                        }}
                    >
                        Export project JSON
                    </button>
                </div>
            )}

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
        </div>
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
        props.project.viewport.set(fitViewport({width: rect.width, height: rect.height}, props.project.images.size));
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
