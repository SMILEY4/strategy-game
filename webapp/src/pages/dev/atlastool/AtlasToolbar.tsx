import type {ReactElement} from "react";
import type {AtlasTool} from "./atlas.types.ts";
import {MAX_ZOOM, MIN_ZOOM, ZOOM_LEVEL_STEP, zoomFromLevel, zoomToLevel} from "./atlas.geometry.ts";

interface AtlasToolbarProps {
    hasImage: boolean;
    atlasName: string;
    onAtlasNameChange: (name: string) => void;
    imageName: string;
    onImageNameChange: (name: string) => void;
    tool: AtlasTool;
    onToolChange: (tool: AtlasTool) => void;
    zoom: number;
    onZoomChange: (zoom: number) => void;
    info: string | null;
    onOpenImage: () => void;
    onLoadJson: () => void;
    onExportJson: () => void;
}

/** Toolbar with image/JSON buttons, tool selection, zoom controls and atlas/image name fields. */
export function AtlasToolbar(props: AtlasToolbarProps): ReactElement {
    return (
        <header className="atlas-toolbar">
            <button type="button" onClick={props.onOpenImage}>
                {props.hasImage ? "Replace image" : "Open image"}
            </button>

            {props.hasImage && (
                <>
                    <button type="button" onClick={props.onLoadJson}>Load JSON</button>
                    <button type="button" onClick={props.onExportJson}>Export JSON</button>

                    <label className="atlas-toolbar__field">
                        Tool (1/2/3)
                        <select
                            value={props.tool}
                            onChange={event => props.onToolChange(event.target.value as AtlasTool)}
                        >
                            <option value="select">Select</option>
                            <option value="draw">Draw</option>
                            <option value="pan">Pan</option>
                        </select>
                    </label>

                    <div className="atlas-zoom">
                        <button
                            type="button"
                            onClick={() => props.onZoomChange(zoomFromLevel(zoomToLevel(props.zoom) - 0.5))}
                            title="Zoom out"
                        >
                            −
                        </button>
                        <input
                            type="range"
                            min={zoomToLevel(MIN_ZOOM)}
                            max={zoomToLevel(MAX_ZOOM)}
                            step={ZOOM_LEVEL_STEP}
                            value={zoomToLevel(props.zoom)}
                            onChange={event => props.onZoomChange(zoomFromLevel(Number(event.target.value)))}
                            onKeyDown={event => event.stopPropagation()}
                        />
                        <button
                            type="button"
                            onClick={() => props.onZoomChange(zoomFromLevel(zoomToLevel(props.zoom) + 0.5))}
                            title="Zoom in"
                        >
                            +
                        </button>
                        <span className="atlas-zoom__value">{props.zoom.toFixed(2)}×</span>
                    </div>

                    <label className="atlas-toolbar__field">
                        Atlas name
                        <input
                            value={props.atlasName}
                            onChange={event => props.onAtlasNameChange(event.target.value)}
                            onKeyDown={event => event.stopPropagation()}
                        />
                    </label>
                    <label className="atlas-toolbar__field">
                        Image name
                        <input
                            value={props.imageName}
                            onChange={event => props.onImageNameChange(event.target.value)}
                            onKeyDown={event => event.stopPropagation()}
                        />
                    </label>
                </>
            )}

            {props.hasImage && props.info && (
                <span className="atlas-toolbar__info">{props.info}</span>
            )}
        </header>
    );
}
