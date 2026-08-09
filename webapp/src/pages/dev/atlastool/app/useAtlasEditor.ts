import type {AtlasLayer, AtlasManifest, AtlasTool, BackgroundMode, ParameterDef, ParameterType, ParameterValue, Rect, Size, SpriteRegion, Viewport} from "@pages/dev/atlastool/app/atlas.types.ts";
import {type RefObject, useRef, useState} from "react";
import {createImageFromDataUrl, downloadJson, fileNameWithoutExtension, readFileAsDataUrl} from "@pages/dev/atlastool/app/atlas.io.ts";
import {exportManifest, parseManifestJson} from "@pages/dev/atlastool/app/atlas.serialization.ts";
import {clamp, MAX_ZOOM, MIN_ZOOM, zoomAt, zoomFromLevel, zoomToLevel} from "@pages/dev/atlastool/app/atlas.geometry.ts";
import {coerceToType, defaultAttributes, defaultValueForType} from "@pages/dev/atlastool/app/atlas.parameters.ts";

export interface AtlasEditor<IsProjectLoaded extends boolean = true | false> {
    open: (images: File[], projectJson: string | null) => Promise<void>,
    project: IsProjectLoaded extends true ? AtlasEditorProject : null,
    refs: {
        canvas: RefObject<HTMLCanvasElement | null>
    }
}

export interface AtlasEditorProject {
    atlas: {
        size: Size,
        name: string,
        updateName: (name: string) => void,
        load: (jsonContent: string) => void
    }
    layers: {
        list: AtlasLayer[],
        active: AtlasLayer,
        add: (files: File[]) => Promise<void>,
        remove: (id: string) => void,
        select: (id: string) => void,
    },
    parameters: {
        list: ParameterDef[],
        add: () => void,
        updateName: (id: string, name: string) => void,
        updateType: (id: string, type: ParameterType) => void,
        remove: (id: string) => void,
    },
    sprites: {
        list: SpriteRegion[],
        selected: SpriteRegion[],
        create: (region: Rect) => void,
        updateRegion: (id: string, patch: Partial<Rect>) => void,
        updateName: (id: string, name: string) => void,
        setAttribute: (spriteId: string, parameterId: string, value: ParameterValue) => void,
        copyAttributes: (spriteId: string) => void,
        pasteAttributes: (spriteId: string) => void,
        attributesClipboard: Record<string, ParameterValue> | null,
        select: (id: string | null) => void,
        toggleSelect: (id: string) => void,
        delete: (id: string) => void,
        deleteSelected: () => void,
        toggleLock: (id: string) => void,
        toggleLockSelected: () => void,
    },
    tool: {
        available: AtlasTool[],
        active: AtlasTool,
        select: (tool: AtlasTool) => void
    }
    viewport: {
        value: Viewport & { zoomLevel: number },
        update: (value: Partial<Viewport>) => void,
        fit: () => void,
        zoomIn: () => void,
        zoomOut: () => void,
        setZoomLevel: (level: number) => void
    },
    settings: {
        background: BackgroundMode,
        setBackground: (mode: BackgroundMode) => void,
    },
    history: {
        undo: () => void,
        redo: () => void,
        canUndo: boolean,
        canRedo: boolean,
        beginBatch: () => void,
        endBatch: () => void,
    },
    export: () => void
}

interface ProjectData {
    name: string,
    size: Size,
    layers: {
        list: AtlasLayer[],
        selectedId: string
    },
    parameters: ParameterDef[],
    sprites: {
        list: SpriteRegion[],
        selectedIds: string[],
    },
    tool: AtlasTool
    viewport: Viewport
    background: BackgroundMode
}

type EditorAction = {
    apply: (project: ProjectData) => ProjectData,
    revert: (project: ProjectData) => ProjectData,
}


export function useAtlasEditor(): AtlasEditor {

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [projectData, setProjectData] = useState<ProjectData | null>(null);
    const [actions, setActions] = useState<EditorAction[]>([]);
    const [actionPointer, setActionPointer] = useState<number>(-1);
    const [attributesClipboard, setAttributesClipboard] = useState<Record<string, ParameterValue> | null>(null);
    const pendingBatchRef = useRef<EditorAction[] | null>(null);

    //=========== PROJECT ================================================================

    async function handleOpen(images: File[], projectJson: string | null): Promise<void> {
        if (images.length === 0) {
            throw new Error("Add at least one image");
        }

        const layers = await Promise.all(images.map(async file => await loadLayer(file, null)));
        const size = layers[0].size;
        for (const layer of layers) {
            if (layer.size.width !== size.width || layer.size.height !== size.height) {
                throw new Error(`Images must all be the same size (found ${size.width}×${size.height} and ${layer.size.width}×${layer.size.height})`);
            }
        }

        let manifest: AtlasManifest | null = null;
        if (projectJson) {
            manifest = loadManifest(projectJson, size);
        }

        setProjectData({
            name: manifest?.atlas.name ?? "atlas",
            size: size,
            layers: {
                list: layers,
                selectedId: layers[0].id,
            },
            parameters: manifest?.parameters ?? [],
            sprites: {
                list: manifest?.sprites ?? [],
                selectedIds: [],
            },
            tool: "Pan",
            viewport: {
                zoom: 1,
                x: 40,
                y: 40,
            },
            background: "fill-dark",
        });

    }

    //=========== ATLAS ==================================================================

    function handleUpdateAtlasName(name: string) {
        if (!projectData) return;
        setProjectData(prev => {
            if (prev == null) return null;
            return {
                ...prev,
                name: name,
            };
        });
    }

    function handleOpenAtlas(jsonContent: string) {
        if (!projectData) return;
        const manifest = loadManifest(jsonContent, projectData.size);
        clearCommitStack();
        setProjectData(prev => {
            if (prev == null) return null;
            return {
                ...prev,
                name: manifest.atlas.name,
                parameters: manifest.parameters,
                sprites: {
                    ...prev.sprites,
                    list: manifest.sprites,
                    selectedIds: [],
                },
            };
        });
    }

    //=========== LAYERS =================================================================

    async function handleAddLayers(files: File[]): Promise<void> {
        if (!projectData) return;
        const layers = await Promise.all(files.map(async file => await loadLayer(file, projectData.size)));
        setProjectData(prev => {
            if (prev == null) return null;
            return {
                ...prev,
                layers: {
                    ...prev.layers,
                    list: [
                        ...prev.layers.list,
                        ...layers,
                    ],
                },
            };
        });
    }

    function handleRemoveLayer(layerId: string) {
        if (!projectData) return;
        if (projectData.layers.list.length === 1) {
            throw new Error("Cannot remove the last layer");
        }
        setProjectData(prev => {
            if (prev == null) return null;
            const newLayers = prev.layers.list.filter(it => it.id !== layerId);
            const newSelectedId = prev.layers.selectedId === layerId ? newLayers[0].id : prev.layers.selectedId;
            return {
                ...prev,
                layers: {
                    ...prev.layers,
                    list: newLayers,
                    selectedId: newSelectedId,
                },
            };
        });
    }

    function handleSelectLayer(layerId: string) {
        if (!projectData) return;
        setProjectData(prev => {
            if (prev == null) return null;
            return {
                ...prev,
                layers: {
                    ...prev.layers,
                    selectedId: layerId,
                },
            };
        });
    }

    //=========== PARAMETERS ============================================================

    function handleAddParameter() {
        if (!projectData) return;
        const def: ParameterDef = {
            id: crypto.randomUUID(),
            name: nextParameterName(projectData.parameters.map(it => it.name)),
            type: "string",
        };
        const defaultValue = defaultValueForType(def.type);
        setProjectData(prev => {
            if (prev == null) return null;
            return {
                ...prev,
                parameters: [...prev.parameters, def],
                sprites: {
                    ...prev.sprites,
                    list: prev.sprites.list.map(sprite => ({
                        ...sprite,
                        attributes: {
                            ...sprite.attributes,
                            [def.id]: defaultValue,
                        },
                    })),
                },
            };
        });
    }

    function handleUpdateParameterName(parameterId: string, name: string) {
        if (!projectData) return;
        setProjectData(prev => {
            if (prev == null) return null;
            return {
                ...prev,
                parameters: prev.parameters.map(param => param.id === parameterId ? {...param, name: name} : param),
            };
        });
    }

    function handleUpdateParameterType(parameterId: string, type: ParameterType) {
        if (!projectData) return;
        setProjectData(prev => {
            if (prev == null) return null;
            return {
                ...prev,
                parameters: prev.parameters.map(param => param.id === parameterId ? {...param, type: type} : param),
                sprites: {
                    ...prev.sprites,
                    list: prev.sprites.list.map(sprite => ({
                        ...sprite,
                        attributes: {
                            ...sprite.attributes,
                            [parameterId]: coerceToType(sprite.attributes[parameterId], type),
                        },
                    })),
                },
            };
        });
    }

    function handleRemoveParameter(parameterId: string) {
        if (!projectData) return;
        setProjectData(prev => {
            if (prev == null) return null;
            return {
                ...prev,
                parameters: prev.parameters.filter(param => param.id !== parameterId),
                sprites: {
                    ...prev.sprites,
                    list: prev.sprites.list.map(sprite => {
                        const attributes = {...sprite.attributes};
                        delete attributes[parameterId];
                        return {...sprite, attributes: attributes};
                    }),
                },
            };
        });
    }

    //=========== TOOLS ==================================================================

    function handleSelectTool(tool: AtlasTool) {
        if (!projectData) return;
        setProjectData(prev => {
            if (prev == null) return null;
            return {
                ...prev,
                tool: tool,
            };
        });
    }

    //=========== VIEWPORT ===============================================================

    function handleUpdateViewport(patch: Partial<Viewport>) {
        if (!projectData) return;
        setProjectData(prev => {
            if (prev == null) return null;
            return {
                ...prev,
                viewport: {
                    ...prev.viewport,
                    ...patch,
                },
            };
        });
    }

    function handleFitViewport() {
        if (!projectData) return;

        const canvasRect = canvasRef.current?.getBoundingClientRect();
        if (!canvasRect) return;

        setProjectData(prev => {
            if (prev == null) return null;
            return {
                ...prev,
                viewport: calculateFitViewport({width: canvasRect.width, height: canvasRect.height}, projectData.size),
            };
        });
    }

    function calculateFitViewport(canvasSize: Size, atlasSize: Size): Viewport {
        if (canvasSize.width <= 0 || canvasSize.height <= 0 || atlasSize.width <= 0 || atlasSize.height <= 0) {
            return {zoom: 1, x: 40, y: 40};
        }
        const zoom = clamp(
            Math.min(canvasSize.width / atlasSize.width, canvasSize.height / atlasSize.height),
            MIN_ZOOM,
            MAX_ZOOM,
        );
        return {
            zoom,
            x: (canvasSize.width - atlasSize.width * zoom) / 2,
            y: (canvasSize.height - atlasSize.height * zoom) / 2,
        };
    }

    function handleZoomIn() {
        stepZoom(-0.5)
    }

    function handleZoomOut() {
        stepZoom(+0.5)
    }

    function stepZoom(step: number) {
        if (!projectData) return;
        setZoomLevel(zoomToLevel(projectData.viewport.zoom) + step)
    }

    function handleSetZoomLevel(level: number) {
        setZoomLevel(level)
    }

    function setZoomLevel(level: number) {
        if (!projectData) return;
        const canvasRect = canvasRef.current?.getBoundingClientRect();
        if (!canvasRect) return;
        setProjectData(prev => {
            if (prev == null) return null;
            const zoom = zoomFromLevel(level);
            const anchor = canvasRect ? {x: canvasRect.width / 2, y: canvasRect.height / 2} : {x: 0, y: 0};
            const viewport = zoomAt(prev.viewport, anchor, zoom);
            return {
                ...prev,
                viewport: viewport,
            };
        });
    }

    function handleSetBackground(mode: BackgroundMode) {
        if (!projectData) return;
        setProjectData(prev => {
            if (prev == null) return null;
            return {
                ...prev,
                background: mode,
            };
        });
    }

    //=========== EXPORT =================================================================

    function handleExport() {
        if (!projectData) return;
        const content = exportManifest({
            atlasName: projectData.name,
            imageSize: projectData.size,
            layers: projectData.layers.list.map(layer => layer.name),
            parameters: projectData.parameters,
            sprites: projectData.sprites.list,
        });
        downloadJson(`${projectData.name || "atlas"}.json`, content);
    }

    //=========== SPRITES ================================================================

    function handleCreateSprite(region: Rect) {
        if (!projectData) return;

        const sprite: SpriteRegion = {
            id: crypto.randomUUID(),
            name: nextSpriteName(projectData.sprites.list.map(it => it.name)),
            locked: false,
            attributes: defaultAttributes(projectData.parameters),
            x: region.x,
            y: region.y,
            width: region.width,
            height: region.height,
        };

        const action: EditorAction = {
            apply: project => ({
                ...project,
                sprites: {
                    ...project.sprites,
                    list: [
                        ...project.sprites.list,
                        sprite,
                    ],
                },
            }),
            revert: project => ({
                ...project,
                sprites: {
                    ...project.sprites,
                    list: project.sprites.list.filter(it => it.id !== sprite.id),
                },
            }),
        };
        commitAction(action);
    }

    function handleUpdateSpriteRegion(spriteId: string, patch: Partial<Rect>) {
        if (!projectData) return;

        const sprite = projectData.sprites.list.find(it => it.id === spriteId);
        if (!sprite) return;

        const before: Rect = {x: sprite.x, y: sprite.y, width: sprite.width, height: sprite.height};
        const after: Rect = {...before, ...patch};
        if (before.x === after.x && before.y === after.y && before.width === after.width && before.height === after.height) {
            return;
        }

        const action: EditorAction = {
            apply: project => ({
                ...project,
                sprites: {
                    ...project.sprites,
                    list: project.sprites.list.map(sprite => {
                        if (sprite.id !== spriteId) return sprite;
                        return {
                            ...sprite,
                            ...after,
                        };
                    }),
                },
            }),
            revert: project => ({
                ...project,
                sprites: {
                    ...project.sprites,
                    list: project.sprites.list.map(sprite => {
                        if (sprite.id !== spriteId) return sprite;
                        return {
                            ...sprite,
                            ...before,
                        };
                    }),
                },
            }),
        };
        commitAction(action);
    }

    function handleUpdateSpriteName(spriteId: string, name: string) {
        if (!projectData) return;

        const sprite = projectData.sprites.list.find(it => it.id === spriteId);
        if (!sprite) return;

        const before = sprite.name;
        const after = name;

        const action: EditorAction = {
            apply: project => ({
                ...project,
                sprites: {
                    ...project.sprites,
                    list: project.sprites.list.map(sprite => {
                        if (sprite.id !== spriteId) return sprite;
                        return {
                            ...sprite,
                            name: after,
                        };
                    }),
                },
            }),
            revert: project => ({
                ...project,
                sprites: {
                    ...project.sprites,
                    list: project.sprites.list.map(sprite => {
                        if (sprite.id !== spriteId) return sprite;
                        return {
                            ...sprite,
                            name: before,
                        };
                    }),
                },
            }),
        };
        commitAction(action);
    }

    function handleSetSpriteAttribute(spriteId: string, parameterId: string, value: ParameterValue) {
        if (!projectData) return;

        const sprite = projectData.sprites.list.find(it => it.id === spriteId);
        if (!sprite) return;

        const before = sprite.attributes[parameterId];
        if (before === value) return;

        const action: EditorAction = {
            apply: project => ({
                ...project,
                sprites: {
                    ...project.sprites,
                    list: project.sprites.list.map(sprite => {
                        if (sprite.id !== spriteId) return sprite;
                        return {
                            ...sprite,
                            attributes: {
                                ...sprite.attributes,
                                [parameterId]: value,
                            },
                        };
                    }),
                },
            }),
            revert: project => ({
                ...project,
                sprites: {
                    ...project.sprites,
                    list: project.sprites.list.map(sprite => {
                        if (sprite.id !== spriteId) return sprite;
                        const attributes = {...sprite.attributes};
                        if (before === undefined) {
                            delete attributes[parameterId];
                        } else {
                            attributes[parameterId] = before;
                        }
                        return {...sprite, attributes: attributes};
                    }),
                },
            }),
        };
        commitAction(action);
    }

    function handleCopyAttributes(spriteId: string) {
        if (!projectData) return;
        const sprite = projectData.sprites.list.find(it => it.id === spriteId);
        if (!sprite) return;
        setAttributesClipboard({...sprite.attributes});
    }

    function handlePasteAttributes(spriteId: string) {
        if (!projectData) return;
        if (attributesClipboard == null) return;
        const sprite = projectData.sprites.list.find(it => it.id === spriteId);
        if (!sprite) return;

        const before = {...sprite.attributes};
        const after = {...before};
        let changed = false;
        for (const param of projectData.parameters) {
            const raw = attributesClipboard[param.id];
            if (raw === undefined) continue;
            const coerced = coerceToType(raw, param.type);
            if (after[param.id] !== coerced) {
                after[param.id] = coerced;
                changed = true;
            }
        }
        if (!changed) return;

        const action: EditorAction = {
            apply: project => ({
                ...project,
                sprites: {
                    ...project.sprites,
                    list: project.sprites.list.map(sprite => {
                        if (sprite.id !== spriteId) return sprite;
                        return {...sprite, attributes: after};
                    }),
                },
            }),
            revert: project => ({
                ...project,
                sprites: {
                    ...project.sprites,
                    list: project.sprites.list.map(sprite => {
                        if (sprite.id !== spriteId) return sprite;
                        return {...sprite, attributes: before};
                    }),
                },
            }),
        };
        commitAction(action);
    }

    function handleSelectSprite(spriteId: string | null) {
        if (!projectData) return;

        const before = projectData.sprites.selectedIds;        const after = spriteId ? [spriteId] : [];

        const action: EditorAction = {
            apply: project => ({
                ...project,
                sprites: {
                    ...project.sprites,
                    selectedIds: after,
                },
            }),
            revert: project => ({
                ...project,
                sprites: {
                    ...project.sprites,
                    selectedIds: before,
                },
            }),
        };
        commitAction(action);
    }

    function handleToggleSelectSprite(spriteId: string) {
        if (!projectData) return;

        const before = projectData.sprites.selectedIds;
        const after = before.includes(spriteId)
            ? before.filter(id => id !== spriteId)
            : [...before, spriteId];

        const action: EditorAction = {
            apply: project => ({
                ...project,
                sprites: {
                    ...project.sprites,
                    selectedIds: after,
                },
            }),
            revert: project => ({
                ...project,
                sprites: {
                    ...project.sprites,
                    selectedIds: before,
                },
            }),
        };
        commitAction(action);
    }

    function handleDeleteSprite(spriteId: string) {
        if (!projectData) return;

        const sprite = projectData.sprites.list.find(it => it.id === spriteId);
        if (!sprite) return;
        const spriteIndex = projectData.sprites.list.indexOf(sprite);

        const selectedBefore = projectData.sprites.selectedIds;
        const selectedAfter = selectedBefore.filter(id => id !== spriteId);

        const action: EditorAction = {
            apply: project => ({
                ...project,
                sprites: {
                    ...project.sprites,
                    list: project.sprites.list.filter(it => it.id !== spriteId),
                    selectedIds: selectedAfter,
                },
            }),
            revert: project => ({
                ...project,
                sprites: {
                    ...project.sprites,
                    list: project.sprites.list.toSpliced(spriteIndex, 0, sprite),
                    selectedIds: selectedBefore,
                },
            }),
        };
        commitAction(action);
    }

    function handleDeleteSelectedSprites() {
        if (!projectData) return;

        const ids = projectData.sprites.selectedIds;
        if (ids.length === 0) return;

        const removed = projectData.sprites.list.filter(it => ids.includes(it.id));
        const indexes = removed.map(sprite => projectData.sprites.list.indexOf(sprite));
        const selectedBefore = [...ids];

        const action: EditorAction = {
            apply: project => ({
                ...project,
                sprites: {
                    ...project.sprites,
                    list: project.sprites.list.filter(it => !ids.includes(it.id)),
                    selectedIds: [],
                },
            }),
            revert: project => {
                let list = project.sprites.list;
                for (let i = indexes.length - 1; i >= 0; i--) {
                    list = list.toSpliced(indexes[i], 0, removed[i]);
                }
                return {
                    ...project,
                    sprites: {
                        ...project.sprites,
                        list: list,
                        selectedIds: selectedBefore,
                    },
                };
            },
        };
        commitAction(action);
    }

    function handleToggleSpriteLock(spriteId: string) {
        if (!projectData) return;
        setProjectData(prev => {
            if (prev == null) return null;
            return {
                ...prev,
                sprites: {
                    ...prev.sprites,
                    list: prev.sprites.list.map(sprite => {
                        if (sprite.id !== spriteId) return sprite;
                        return {
                            ...sprite,
                            locked: !sprite.locked,
                        };
                    }),
                },
            };
        });
    }

    function handleToggleLockSelected() {
        if (!projectData) return;
        const ids = projectData.sprites.selectedIds;
        if (ids.length === 0) return;
        setProjectData(prev => {
            if (prev == null) return null;
            return {
                ...prev,
                sprites: {
                    ...prev.sprites,
                    list: prev.sprites.list.map(sprite => ids.includes(sprite.id) ? {...sprite, locked: !sprite.locked} : sprite),
                },
            };
        });
    }

    //=========== EDITOR ACTIONS =========================================================

    function clearCommitStack() {
        setActions([]);
    }

    function commitAction(action: EditorAction) {
        if (!projectData) return;
        if (pendingBatchRef.current) {
            pendingBatchRef.current.push(action);
            setProjectData(prev => prev == null ? null : action.apply(prev));
        } else {
            setProjectData(prev => prev == null ? null : action.apply(prev));
            setActions(prev => [...prev.slice(0, actionPointer + 1), action]);
            setActionPointer(prev => prev + 1);
        }
    }

    function beginBatch() {
        pendingBatchRef.current = [];
    }

    function endBatch() {
        const batch = pendingBatchRef.current;
        pendingBatchRef.current = null;
        if (batch && batch.length > 0) {
            commitAction(composeActions(batch));
        }
    }

    function handleUndo() {
        if (!projectData) return;
        if (actionPointer < 0) return;

        setProjectData(prev => prev == null ? null : actions[actionPointer].revert(prev));
        setActionPointer(prev => prev - 1);
    }


    function handleRedo() {
        if (!projectData) return;
        if (actionPointer >= actions.length - 1) return;
        setProjectData(prev => prev == null ? null : actions[actionPointer+1].apply(prev));
        setActionPointer(prev => prev + 1);
    }


    //=========== RETURN =================================================================

    return {
        open: handleOpen,
        project: projectData
            ? {
                atlas: {
                    name: projectData.name,
                    size: projectData.size,
                    updateName: handleUpdateAtlasName,
                    load: handleOpenAtlas,
                },
                layers: {
                    list: projectData.layers.list,
                    active: projectData.layers.list.find(it => it.id === projectData.layers.selectedId)!,
                    add: handleAddLayers,
                    remove: handleRemoveLayer,
                    select: handleSelectLayer,
                },
                parameters: {
                    list: projectData.parameters,
                    add: handleAddParameter,
                    updateName: handleUpdateParameterName,
                    updateType: handleUpdateParameterType,
                    remove: handleRemoveParameter,
                },
                sprites: {
                    list: projectData.sprites.list,
                    selected: projectData.sprites.selectedIds
                        .map(id => projectData.sprites.list.find(it => it.id === id))
                        .filter((sprite): sprite is SpriteRegion => sprite != null),
                    create: handleCreateSprite,
                    updateRegion: handleUpdateSpriteRegion,
                    updateName: handleUpdateSpriteName,
                    setAttribute: handleSetSpriteAttribute,
                    copyAttributes: handleCopyAttributes,
                    pasteAttributes: handlePasteAttributes,
                    attributesClipboard: attributesClipboard,
                    select: handleSelectSprite,
                    toggleSelect: handleToggleSelectSprite,
                    delete: handleDeleteSprite,
                    deleteSelected: handleDeleteSelectedSprites,
                    toggleLock: handleToggleSpriteLock,
                    toggleLockSelected: handleToggleLockSelected,
                },
                tool: {
                    available: ["Select", "Pan", "Draw"],
                    active: projectData.tool,
                    select: handleSelectTool,
                },
                viewport: {
                    value: {
                        ...projectData.viewport,
                        zoomLevel: zoomToLevel(projectData.viewport.zoom)
                    },
                    update: handleUpdateViewport,
                    fit: handleFitViewport,
                    zoomIn: handleZoomIn,
                    zoomOut: handleZoomOut,
                    setZoomLevel: handleSetZoomLevel
                },
                settings: {
                    background: projectData.background,
                    setBackground: handleSetBackground,
                },
                history: {
                    undo: handleUndo,
                    redo: handleRedo,
                    canUndo: actionPointer >= 0,
                    canRedo: actionPointer < actions.length - 1,
                    beginBatch: beginBatch,
                    endBatch: endBatch,
                },
                export: handleExport,
            }
            : null,
        refs: {
            canvas: canvasRef,
        },
    };
}


function loadManifest(jsonContent: string, size: Size): AtlasManifest {
    const manifest: AtlasManifest = parseManifestJson(jsonContent);
    if (manifest.atlas.imageSize.width !== size.width || manifest.atlas.imageSize.height !== size.height) {
        throw new Error(`Project image size is ${manifest.atlas.imageSize.width}×${manifest.atlas.imageSize.height}, but the selected images are ${size.width}×${size.height}`);
    }
    return manifest;
}

async function loadLayer(file: File, size: Size | null): Promise<AtlasLayer> {
    const element = await createImageFromDataUrl(await readFileAsDataUrl(file));
    const layer: AtlasLayer = {
        id: crypto.randomUUID(),
        name: fileNameWithoutExtension(file.name),
        element: element,
        size: {width: element.naturalWidth, height: element.naturalHeight},
        alpha: null,
    };
    if (size && (size.width !== layer.size.width || size.height !== layer.size.height)) {
        throw new Error(`Images must all be the same size (expected ${size.width}×${size.height}, actual ${layer.size.width}×${layer.size.height})`);
    }
    return layer;
}

function nextSpriteName(existingNames: string[]): string {
    let index = 0;
    let name: string;
    do {
        index++;
        name = `sprite-${index}`;
    } while (existingNames.includes(name));
    return name;
}

function nextParameterName(existingNames: string[]): string {
    let index = 0;
    let name: string;
    do {
        index++;
        name = `parameter-${index}`;
    } while (existingNames.includes(name));
    return name;
}

function composeActions(actions: EditorAction[]): EditorAction {
    return {
        apply: project => actions.reduce((acc, action) => action.apply(acc), project),
        revert: project => [...actions].reverse().reduce((acc, action) => action.revert(acc), project),
    };
}