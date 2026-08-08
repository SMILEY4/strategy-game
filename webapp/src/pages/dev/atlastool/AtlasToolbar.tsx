import {type ReactElement, type RefObject, useRef} from "react";
import type {AtlasTool} from "./app/atlas.types.ts";
import {MAX_ZOOM, MIN_ZOOM, ZOOM_LEVEL_STEP, zoomAt, zoomFromLevel, zoomToLevel} from "./app/atlas.geometry.ts";
import type {AtlasEditor} from "@pages/dev/atlastool/app/atlas.editor.ts";
import {readFileAsText} from "@pages/dev/atlastool/app/atlas.io.ts";

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

                <label className="atlas-toolbar__field">
                    Tool
                    <select
                        value={props.project.tool.active}
                        onChange={event => props.project.tool.select(event.target.value as AtlasTool)}
                    >
                        {props.project.tool.available.map(tool => (
                            <option value={tool.id}>{tool.displayName}</option>
                        ))}
                    </select>
                </label>

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

                <label className="atlas-toolbar__field">
                    Image name
                    <input
                        value={props.project.imageName.value}
                        onChange={event => props.project.imageName.set(event.target.value)}
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
