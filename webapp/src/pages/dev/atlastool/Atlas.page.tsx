import {useEffect, useRef, useState, type ReactElement, type DragEvent as ReactDragEvent} from "react";
import {AtlasCanvas} from "@pages/dev/atlastool/AtlasCanvas.tsx";
import {useAtlasEditor} from "@pages/dev/atlastool/useAtlasEditor.ts";
import type {AnnotationValue, AtlasTool, Rect, SpriteRegion} from "@pages/dev/atlastool/atlas.types.ts";
import {clampMove, MIN_ZOOM, MAX_ZOOM, ZOOM_LEVEL_STEP, zoomFromLevel, zoomToLevel} from "@pages/dev/atlastool/atlas.geometry.ts";
import "./atlas.page.less";

function downloadText(filename: string, text: string) {
    const blob = new Blob([text], {type: "application/json"});
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
}

function annotationToText(value: AnnotationValue): string {
    return JSON.stringify(value);
}

export function AtlasPage(): ReactElement {

    const editor = useAtlasEditor();
    const imageInputRef = useRef<HTMLInputElement>(null);
    const projectInputRef = useRef<HTMLInputElement>(null);

    const [tool, setTool] = useState<AtlasTool>("select");
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({x: 40, y: 40});

    async function openImageFile(file: File) {
        await editor.loadImageFile(file);
        setPan({x: 40, y: 40});
        setZoom(1);
    }

    async function loadProjectFile(file: File) {
        const text = await file.text();
        try {
            editor.applyProjectJson(text);
        } catch (error) {
            window.alert(error instanceof Error ? error.message : "Could not load JSON");
        }
    }

    function handleDrop(event: ReactDragEvent) {
        event.preventDefault();
        const files = Array.from(event.dataTransfer.files ?? []);
        const imageFile = files.find(file => file.type.startsWith("image/"));
        const jsonFile = files.find(file => file.type === "application/json" || file.name.endsWith(".json"));
        if (imageFile && jsonFile) {
            void (async () => {
                await openImageFile(imageFile);
                await loadProjectFile(jsonFile);
            })();
        } else if (imageFile) {
            void openImageFile(imageFile);
        } else if (jsonFile) {
            void loadProjectFile(jsonFile);
        }
    }

    useEffect(() => {
        const TOOL_SHORTCUTS: Record<string, AtlasTool> = {
            "1": "select",
            v: "select",
            "2": "draw",
            d: "draw",
            "3": "pan",
            p: "pan",
        };
        function onKeyDown(event: KeyboardEvent) {
            const target = event.target as HTMLElement | null;
            if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT" || target.isContentEditable)) {
                return;
            }
            if (event.ctrlKey || event.metaKey || event.altKey) {
                return;
            }
            const nextTool = TOOL_SHORTCUTS[event.key.toLowerCase()];
            if (nextTool) {
                setTool(nextTool);
                return;
            }
            if (!editor.image || !editor.selectedSpriteId) {
                return;
            }
            if (event.key === "Delete" || event.key === "Backspace") {
                event.preventDefault();
                editor.deleteSprite(editor.selectedSpriteId);
                return;
            }
            const deltas: Record<string, { dx: number, dy: number }> = {
                ArrowLeft: {dx: -1, dy: 0},
                ArrowRight: {dx: 1, dy: 0},
                ArrowUp: {dx: 0, dy: -1},
                ArrowDown: {dx: 0, dy: 1},
            };
            const delta = deltas[event.key];
            if (!delta) {
                return;
            }
            event.preventDefault();
            const step = event.shiftKey ? 10 : 1;
            const sprite = editor.sprites.find(candidate => candidate.id === editor.selectedSpriteId);
            if (sprite) {
                editor.updateSprite(sprite.id, clampMove(
                    sprite,
                    delta.dx * step,
                    delta.dy * step,
                    editor.imageWidth,
                    editor.imageHeight,
                ));
            }
        }
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [editor]);

    function setRegionField(sprite: SpriteRegion, field: keyof Rect, rawValue: string) {
        const value = Math.round(Number(rawValue));
        if (!Number.isFinite(value)) {
            return;
        }
        const region: Rect = {
            x: field === "x" ? value : sprite.x,
            y: field === "y" ? value : sprite.y,
            width: field === "width" ? value : sprite.width,
            height: field === "height" ? value : sprite.height,
        };
        editor.updateSprite(sprite.id, region);
    }

    const selectedSprite = editor.selectedSpriteId
        ? editor.sprites.find(sprite => sprite.id === editor.selectedSpriteId) ?? null
        : null;

    return (
        <div className="atlas-page" onDragOver={event => event.preventDefault()} onDrop={handleDrop}>

            <header className="atlas-toolbar">
                <button type="button" onClick={() => imageInputRef.current?.click()}>
                    {editor.image ? "Replace image" : "Open image"}
                </button>
                <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={event => {
                        const file = event.target.files?.[0];
                        if (file) {
                            void openImageFile(file);
                        }
                        event.target.value = "";
                    }}
                />

                {editor.image && (
                    <>
                        <button type="button" onClick={() => projectInputRef.current?.click()}>Load JSON</button>
                        <input
                            ref={projectInputRef}
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
                        <button type="button" onClick={() => downloadText(`${editor.atlasName || "atlas"}.json`, editor.exportJson())}>
                            Export JSON
                        </button>

                        <label className="atlas-toolbar__field">
                            Tool (1/2/3)
                            <select
                                value={tool}
                                onChange={event => setTool(event.target.value as AtlasTool)}
                            >
                                <option value="select">Select</option>
                                <option value="draw">Draw</option>
                                <option value="pan">Pan</option>
                            </select>
                        </label>

                        <div className="atlas-zoom">
                            <button
                                type="button"
                                onClick={() => setZoom(prev => zoomFromLevel(zoomToLevel(prev) - 0.5))}
                                title="Zoom out"
                            >
                                −
                            </button>
                            <input
                                type="range"
                                min={zoomToLevel(MIN_ZOOM)}
                                max={zoomToLevel(MAX_ZOOM)}
                                step={ZOOM_LEVEL_STEP}
                                value={zoomToLevel(zoom)}
                                onChange={event => setZoom(zoomFromLevel(Number(event.target.value)))}
                                onKeyDown={event => event.stopPropagation()}
                            />
                            <button
                                type="button"
                                onClick={() => setZoom(prev => zoomFromLevel(zoomToLevel(prev) + 0.5))}
                                title="Zoom in"
                            >
                                +
                            </button>
                            <span className="atlas-zoom__value">{zoom.toFixed(2)}×</span>
                        </div>

                        <label className="atlas-toolbar__field">
                            Atlas name
                            <input
                                value={editor.atlasName}
                                onChange={event => editor.setAtlasName(event.target.value)}
                                onKeyDown={event => event.stopPropagation()}
                            />
                        </label>
                        <label className="atlas-toolbar__field">
                            Image name
                            <input
                                value={editor.imageName}
                                onChange={event => editor.setImageName(event.target.value)}
                                onKeyDown={event => event.stopPropagation()}
                            />
                        </label>
                    </>
                )}

                {editor.image && (
                    <span className="atlas-toolbar__info">
                        {editor.imageWidth}×{editor.imageHeight}px · {editor.sprites.length} sprites
                    </span>
                )}
            </header>

            {!editor.image && (
                <div className="atlas-dropzone">
                    <p>Drop a sprite sheet image here to start a new project, or</p>
                    <button type="button" onClick={() => imageInputRef.current?.click()}>choose a file</button>
                    <p>To continue a project, load the image together with its exported JSON (drop both at once).</p>
                </div>
            )}

            {editor.image && (
                <div className="atlas-main">
                    <div className="atlas-canvas-wrap">
                        <AtlasCanvas
                            image={editor.image}
                            imageWidth={editor.imageWidth}
                            imageHeight={editor.imageHeight}
                            sprites={editor.sprites}
                            selectedSpriteId={editor.selectedSpriteId}
                            tool={tool}
                            zoom={zoom}
                            pan={pan}
                            onSelectSprite={editor.selectSprite}
                            onCreateSprite={editor.createSprite}
                            onUpdateSprite={editor.updateSprite}
                            onSetZoom={setZoom}
                            onSetPan={setPan}
                        />
                        <div className="atlas-canvas-wrap__hint">
                            tools: 1/v select · 2/d draw · 3/p pan · wheel: zoom · middle-drag: pan · arrows: nudge (shift: ×10) · del: remove
                        </div>
                    </div>

                    <aside className="atlas-side">
                        <div className="atlas-side__section">
                            <div className="atlas-side__header">Sprites</div>
                            {editor.sprites.length === 0 && <div className="atlas-side__empty">No sprites yet. Draw rectangles on the image.</div>}
                            <ul className="atlas-sprite-list">
                                {editor.sprites.map(sprite => (
                                    <li
                                        key={sprite.id}
                                        className={`atlas-sprite-list__item${sprite.id === editor.selectedSpriteId ? " atlas-sprite-list__item--selected" : ""}`}
                                    >
                                        <button
                                            type="button"
                                            className="atlas-sprite-list__select"
                                            onClick={() => editor.selectSprite(sprite.id === editor.selectedSpriteId ? null : sprite.id)}
                                        >
                                            <span className="atlas-sprite-list__name">{sprite.name || sprite.id}</span>
                                            <span className="atlas-sprite-list__meta">
                                                {sprite.x},{sprite.y} · {sprite.width}×{sprite.height}
                                            </span>
                                        </button>
                                        <button
                                            type="button"
                                            className="atlas-sprite-list__delete"
                                            onClick={() => editor.deleteSprite(sprite.id)}
                                        >
                                            ✕
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {selectedSprite && (
                            <div className="atlas-side__section">
                                <div className="atlas-side__header">Sprite</div>

                                <label className="atlas-field">
                                    Id
                                    <input
                                        value={selectedSprite.id}
                                        onChange={event => editor.updateSpriteMeta(selectedSprite.id, {id: event.target.value})}
                                        onKeyDown={event => event.stopPropagation()}
                                    />
                                </label>
                                <label className="atlas-field">
                                    Name
                                    <input
                                        value={selectedSprite.name}
                                        onChange={event => editor.updateSpriteMeta(selectedSprite.id, {name: event.target.value})}
                                        onKeyDown={event => event.stopPropagation()}
                                    />
                                </label>

                                <div className="atlas-grid">
                                    <label className="atlas-field">
                                        X
                                        <input
                                            type="number"
                                            value={selectedSprite.x}
                                            onChange={event => setRegionField(selectedSprite, "x", event.target.value)}
                                            onKeyDown={event => event.stopPropagation()}
                                        />
                                    </label>
                                    <label className="atlas-field">
                                        Y
                                        <input
                                            type="number"
                                            value={selectedSprite.y}
                                            onChange={event => setRegionField(selectedSprite, "y", event.target.value)}
                                            onKeyDown={event => event.stopPropagation()}
                                        />
                                    </label>
                                    <label className="atlas-field">
                                        W
                                        <input
                                            type="number"
                                            value={selectedSprite.width}
                                            onChange={event => setRegionField(selectedSprite, "width", event.target.value)}
                                            onKeyDown={event => event.stopPropagation()}
                                        />
                                    </label>
                                    <label className="atlas-field">
                                        H
                                        <input
                                            type="number"
                                            value={selectedSprite.height}
                                            onChange={event => setRegionField(selectedSprite, "height", event.target.value)}
                                            onKeyDown={event => event.stopPropagation()}
                                        />
                                    </label>
                                </div>

                                <div className="atlas-side__subheader">Annotations <span className="atlas-side__subnote">(values are JSON)</span></div>
                                {Object.keys(selectedSprite.annotations).length === 0 && (
                                    <div className="atlas-side__empty">No annotations.</div>
                                )}
                                {Object.entries(selectedSprite.annotations).map(([key, value]) => (
                                    <div key={key} className="atlas-annotation">
                                        <input
                                            className="atlas-annotation__key"
                                            value={key}
                                            onChange={event => editor.updateAnnotationKey(selectedSprite.id, key, event.target.value)}
                                            onKeyDown={event => event.stopPropagation()}
                                        />
                                        <input
                                            className="atlas-annotation__value"
                                            value={annotationToText(value)}
                                            onChange={event => editor.updateAnnotationValue(selectedSprite.id, key, event.target.value)}
                                            onKeyDown={event => event.stopPropagation()}
                                        />
                                        <button
                                            type="button"
                                            className="atlas-annotation__remove"
                                            onClick={() => editor.removeAnnotation(selectedSprite.id, key)}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => {
                                        let index = 0;
                                        let key = "key";
                                        while (key in selectedSprite.annotations) {
                                            index++;
                                            key = `key${index}`;
                                        }
                                        editor.addAnnotation(selectedSprite.id, key);
                                    }}
                                >
                                    Add annotation
                                </button>
                            </div>
                        )}
                    </aside>
                </div>
            )}
        </div>
    );
}
