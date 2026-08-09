import {type ReactElement, type RefObject, useRef} from "react";
import type {AtlasTool} from "./app/atlas.types.ts";
import {MAX_ZOOM, MIN_ZOOM, ZOOM_LEVEL_STEP, zoomAt, zoomFromLevel, zoomToLevel} from "./app/atlas.geometry.ts";
import type {AtlasEditor} from "@pages/dev/atlastool/app/atlas.editor.ts";
import {readFileAsText} from "@pages/dev/atlastool/app/atlas.io.ts";

const TOOL_HOTKEYS: Record<AtlasTool, string> = {
    select: "V",
    draw: "D",
    pan: "P",
};

function ToolIconSelect(): ReactElement {
    return (
        <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden="true">
            <path d="M3.5 2v11.2l3.1-3.1h4.2L3.5 2z"/>
        </svg>
    );
}

function ToolIconDraw(): ReactElement {
    return (
        <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <rect x="2.75" y="2.75" width="10.5" height="10.5" rx="1"/>
        </svg>
    );
}

function ToolIconPan(): ReactElement {
    return (
        <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden="true">
            <path d="M5.5 3a1 1 0 0 1 2 0v4.5h1.75V2a1 1 0 0 1 2 0v5.5h1.75V4.5a1 1 0 0 1 2 0v5.25A4.25 4.25 0 0 1 11 14H9.5a3 3 0 0 1-2.2-.98L4 9.7a1 1 0 0 1 1.45-1.38L6.5 9.6V3z"/>
        </svg>
    );
}

const TOOL_ICONS: Record<AtlasTool, () => ReactElement> = {
    select: ToolIconSelect,
    draw: ToolIconDraw,
    pan: ToolIconPan,
};

export function AtlasToolbar(props: AtlasEditor<true> & { canvasRef?: RefObject<HTMLCanvasElement | null> }): ReactElement {

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

    function setViewportZoom(nextZoom: number) {
        const rect = props.canvasRef?.current?.getBoundingClientRect();
        const anchor = rect ? {x: rect.width / 2, y: rect.height / 2} : {x: 0, y: 0};
        props.project.viewport.set(zoomAt(props.project.viewport.value, anchor, nextZoom));
    }

    return (
        <>
            <header className="atlas-toolbar">

                <button type="button" onClick={() => inputImageRef.current?.click()}>Replace image</button>
                <button type="button" onClick={() => inputJsonRef.current?.click()}>Load JSON</button>
                <button type="button" onClick={props.project.export.projectJson}>Export JSON</button>

                <div className="atlas-tools" role="group" aria-label="Tool">
                    {props.project.tool.available.map(tool => {
                        const Icon = TOOL_ICONS[tool.id];
                        const active = props.project.tool.active === tool.id;
                        return (
                            <button
                                key={tool.id}
                                type="button"
                                className={active ? "atlas-tools__button atlas-tools__button--active" : "atlas-tools__button"}
                                title={`${tool.displayName} (${TOOL_HOTKEYS[tool.id]})`}
                                aria-pressed={active}
                                onClick={() => props.project.tool.select(tool.id)}
                            >
                                <Icon/>
                            </button>
                        );
                    })}
                </div>

                <div className="atlas-zoom">
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
                    <span className="atlas-zoom__value">{props.project.viewport.value.zoom.toFixed(2)}×</span>
                </div>

                <label className="atlas-toolbar__field">
                    Atlas name
                    <input
                        value={props.project.atlasName.value}
                        onChange={event => props.project.atlasName.set(event.target.value)}
                        onKeyDown={event => event.stopPropagation()}
                    />
                </label>

                <span className="atlas-toolbar__info">
                    {`${props.project.image.size.width}×${props.project.image.size.height}px · ${props.project.sprites.list.length} sprites`}
                </span>

            </header>

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
