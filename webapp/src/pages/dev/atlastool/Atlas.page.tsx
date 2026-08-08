import {useState, type ReactElement} from "react";
import {AtlasCanvas} from "./AtlasCanvas.tsx";
import {AtlasToolbar} from "./AtlasToolbar.tsx";
import {SpriteEditor} from "./SpriteEditor.tsx";
import {SpriteList} from "./SpriteList.tsx";
import {useAtlasEditor} from "./useAtlasEditor.ts";
import {useAtlasFiles} from "./useAtlasFiles.ts";
import {useAtlasKeyboard} from "./atlas.shortcuts.ts";
import {downloadText} from "./atlas.io.ts";
import type {AtlasTool, Viewport} from "./atlas.types.ts";
import "./atlas.page.less";

const INITIAL_VIEWPORT: Viewport = {zoom: 1, x: 40, y: 40};

/** Composition root: wires editor state, file loading, shortcuts and the UI together. */
export function AtlasPage(): ReactElement {

    const editor = useAtlasEditor();
    const [tool, setTool] = useState<AtlasTool>("select");
    const [viewport, setViewport] = useState<Viewport>(INITIAL_VIEWPORT);

    const {imageInputRef, projectInputRef, openImageFile, loadProjectFile, handleDrop} =
        useAtlasFiles(editor, () => setViewport(INITIAL_VIEWPORT));

    useAtlasKeyboard(editor, setTool);

    const selectedSprite = editor.selectedSpriteId
        ? editor.sprites.find(sprite => sprite.id === editor.selectedSpriteId) ?? null
        : null;

    return (
        <div className="atlas-page" onDragOver={event => event.preventDefault()} onDrop={handleDrop}>

            <AtlasToolbar
                hasImage={editor.image !== null}
                atlasName={editor.atlasName}
                onAtlasNameChange={editor.setAtlasName}
                imageName={editor.imageName}
                onImageNameChange={editor.setImageName}
                tool={tool}
                onToolChange={setTool}
                zoom={viewport.zoom}
                onZoomChange={zoom => setViewport(prev => ({...prev, zoom}))}
                info={editor.image ? `${editor.imageSize.width}×${editor.imageSize.height}px · ${editor.sprites.length} sprites` : null}
                onOpenImage={() => imageInputRef.current?.click()}
                onLoadJson={() => projectInputRef.current?.click()}
                onExportJson={() => downloadText(`${editor.atlasName || "atlas"}.json`, editor.exportJson())}
            />

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
                            imageSize={editor.imageSize}
                            sprites={editor.sprites}
                            selectedSpriteId={editor.selectedSpriteId}
                            tool={tool}
                            viewport={viewport}
                            onSelectSprite={editor.selectSprite}
                            onCreateSprite={editor.createSprite}
                            onUpdateSprite={editor.updateSprite}
                            onSetViewport={setViewport}
                        />
                        <div className="atlas-canvas-wrap__hint">
                            tools: 1/v select · 2/d draw · 3/p pan · wheel: zoom · middle-drag: pan · arrows: nudge (shift: ×10) · del: remove
                        </div>
                    </div>

                    <aside className="atlas-side">
                        <SpriteList
                            sprites={editor.sprites}
                            selectedSpriteId={editor.selectedSpriteId}
                            onSelect={editor.selectSprite}
                            onDelete={editor.deleteSprite}
                        />
                        {selectedSprite && (
                            <SpriteEditor
                                sprite={selectedSprite}
                                onUpdateRegion={editor.updateSprite}
                                onUpdateMeta={editor.updateSpriteMeta}
                                onAddAnnotation={editor.addAnnotation}
                                onUpdateAnnotationKey={editor.updateAnnotationKey}
                                onUpdateAnnotationValue={editor.updateAnnotationValue}
                                onRemoveAnnotation={editor.removeAnnotation}
                            />
                        )}
                    </aside>
                </div>
            )}
        </div>
    );
}
