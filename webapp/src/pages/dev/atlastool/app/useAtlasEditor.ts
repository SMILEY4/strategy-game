import {useCallback, useState} from "react";
import type {AnnotationValue, AtlasTool, Rect, Size, SpriteRegion, Viewport} from "./atlas.types.ts";
import {clampRectToImage} from "./atlas.geometry.ts";
import {exportManifest, manifestToSprites, parseManifestJson} from "./atlas.serialization.ts";
import {createImageFromDataUrl, downloadJson, readFileAsDataUrl} from "./atlas.io.ts";
import type {AtlasEditor} from "@pages/dev/atlastool/app/atlas.editor.ts";

interface LoadedImage {
    element: HTMLImageElement;
    size: Size;
}

function withoutSprite(sprites: SpriteRegion[], id: string): SpriteRegion[] {
    return sprites.filter(sprite => sprite.id !== id);
}

function updateAnnotations(
    sprites: SpriteRegion[],
    id: string,
    update: (annotations: Record<string, AnnotationValue>) => Record<string, AnnotationValue>,
): SpriteRegion[] {
    return sprites.map(sprite => {
        if (sprite.id !== id || sprite.locked) {
            return sprite;
        }
        const annotations = update(sprite.annotations);
        return annotations === sprite.annotations ? sprite : {...sprite, annotations};
    });
}

export const INITIAL_VIEWPORT: Viewport = {zoom: 1, x: 40, y: 40};

/** Editor state and actions: current image, sprites, selection, annotations, and export. */
export function useAtlasEditor(): AtlasEditor {
    const [atlasName, setAtlasName] = useState("atlas");
    const [loadedImage, setLoadedImage] = useState<LoadedImage | null>(null);
    const [sprites, setSprites] = useState<SpriteRegion[]>([]);
    const [selectedSpriteId, setSelectedSpriteId] = useState<string | null>(null);
    const [tool, setTool] = useState<AtlasTool>("select");
    const [viewport, setViewport] = useState<Viewport>(INITIAL_VIEWPORT);

    const image = loadedImage?.element ?? null;
    const imageSize = loadedImage?.size ?? {width: 0, height: 0};

    const selectedSprite = selectedSpriteId
        ? sprites.find(sprite => sprite.id === selectedSpriteId) ?? null
        : null;

    /** Loads a new image, resetting all sprites. */
    const loadImageDataUrl = useCallback(async (dataUrl: string) => {
        const element = await createImageFromDataUrl(dataUrl);
        setLoadedImage({element, size: {width: element.naturalWidth, height: element.naturalHeight}});
        setSprites([]);
        setSelectedSpriteId(null);
    }, []);

    const loadImageFile = useCallback(async (file: File) => {
        const dataUrl = await readFileAsDataUrl(file);
        await loadImageDataUrl(dataUrl);
    }, [loadImageDataUrl]);

    /** Loads an image and a project JSON atomically, without relying on state that may be stale in the caller. */
    const loadImageAndProject = useCallback(async (imageFile: File, projectJson: string) => {
        const dataUrl = await readFileAsDataUrl(imageFile);
        const element = await createImageFromDataUrl(dataUrl);
        const size = {width: element.naturalWidth, height: element.naturalHeight};
        const manifest = parseManifestJson(projectJson);
        setLoadedImage({element, size});
        setSprites(manifestToSprites(manifest, size));
        setSelectedSpriteId(null);
        setAtlasName(manifest.atlas.name);
    }, []);

    /** Loads a project JSON file, replacing the current sprite set. Requires an image. */
    const applyProjectJson = useCallback((json: string) => {
        if (!image) {
            throw new Error("Load an image first");
        }
        const manifest = parseManifestJson(json);
        setSprites(manifestToSprites(manifest, imageSize));
        setSelectedSpriteId(null);
        setAtlasName(manifest.atlas.name);
    }, [image, imageSize]);

    /** Serializes the current editor state to a JSON string and downloads it. */
    const exportJson = useCallback((): string => {
        if (!image) {
            throw new Error("No image loaded");
        }
        const content = exportManifest({atlasName, imageSize, sprites});
        downloadJson(`${atlasName || "atlas"}.json`, content);
        return content;
    }, [atlasName, image, imageSize, sprites]);

    const createSprite = useCallback((region: Rect) => {
        const clamped = clampRectToImage(region, imageSize);
        const id = generateSpriteId(sprites.map(sprite => sprite.id));
        setSprites(prev => [...prev, {id, name: id, ...clamped, annotations: {}, locked: false}]);
        setSelectedSpriteId(id);
    }, [imageSize, sprites]);

    const updateSprite = useCallback((id: string, patch: Partial<Rect>) => {
        setSprites(prev => prev.map(sprite => sprite.id === id && !sprite.locked ? {...sprite, ...patch} : sprite));
    }, []);

    const updateSpriteMeta = useCallback((id: string, patch: Partial<Pick<SpriteRegion, "id" | "name">>) => {
        const target = sprites.find(sprite => sprite.id === id);
        if (!target || target.locked) {
            return;
        }
        const effective: Partial<Pick<SpriteRegion, "id" | "name">> = {};
        if (patch.id !== undefined && patch.id.trim() && !sprites.some(sprite => sprite.id === patch.id)) {
            effective.id = patch.id;
        }
        if (patch.name !== undefined) {
            effective.name = patch.name;
        }
        if (Object.keys(effective).length === 0) {
            return;
        }
        setSprites(prev => prev.map(sprite => sprite.id === id ? {...sprite, ...effective} : sprite));
        if (effective.id) {
            setSelectedSpriteId(current => current === id ? effective.id! : current);
        }
    }, [sprites]);

    const deleteSprite = useCallback((id: string) => {
        const target = sprites.find(sprite => sprite.id === id);
        if (target?.locked) {
            return;
        }
        setSprites(prev => withoutSprite(prev, id));
        setSelectedSpriteId(current => current === id ? null : current);
    }, [sprites]);

    const selectSprite = useCallback((id: string | null) => {
        setSelectedSpriteId(id);
    }, []);

    const toggleSpriteLock = useCallback((id: string) => {
        setSprites(prev => prev.map(sprite => sprite.id === id ? {...sprite, locked: !sprite.locked} : sprite));
    }, []);

    const addAnnotation = useCallback((id: string, key: string) => {
        setSprites(prev => updateAnnotations(prev, id, annotations =>
            key in annotations ? annotations : {...annotations, [key]: ""},
        ));
    }, []);

    const updateAnnotationKey = useCallback((id: string, oldKey: string, newKey: string) => {
        if (!newKey.trim() || newKey === oldKey) {
            return;
        }
        setSprites(prev => updateAnnotations(prev, id, annotations => {
            if (!(oldKey in annotations)) {
                return annotations;
            }
            const {[oldKey]: value, ...rest} = annotations;
            return {...rest, [newKey]: value};
        }));
    }, []);

    const updateAnnotationValue = useCallback((id: string, key: string, text: string) => {
        const value = parseAnnotationValue(text);
        setSprites(prev => updateAnnotations(prev, id, annotations =>
            key in annotations ? {...annotations, [key]: value} : annotations,
        ));
    }, []);

    const removeAnnotation = useCallback((id: string, key: string) => {
        setSprites(prev => updateAnnotations(prev, id, annotations => {
            if (!(key in annotations)) {
                return annotations;
            }
            const {[key]: _removed, ...rest} = annotations;
            return rest;
        }));
    }, []);

    return {
        load: {
            image: loadImageFile,
            projectJson: applyProjectJson,
            imageAndProject: loadImageAndProject,
        },
        project: loadedImage ? {
            atlasName: {
                value: atlasName,
                set: setAtlasName,
            },
            image: {
                element: loadedImage.element,
                size: imageSize,
            },
            sprites: {
                list: sprites,
                selectedId: selectedSpriteId,
                selected: selectedSprite,
                create: createSprite,
                updateRegion: updateSprite,
                updateMeta: updateSpriteMeta,
                delete: deleteSprite,
                select: selectSprite,
                toggleLock: toggleSpriteLock,
                addAnnotation: addAnnotation,
                updateAnnotationKey: updateAnnotationKey,
                updateAnnotationValue: updateAnnotationValue,
                removeAnnotation: removeAnnotation,
            },
            tool: {
                available: [
                    {id: "select", displayName: "Select"},
                    {id: "draw", displayName: "Draw"},
                    {id: "pan", displayName: "Pan"},
                ],
                active: tool,
                select: setTool,
            },
            viewport: {
                value: viewport,
                set: (value: Partial<Viewport>) => setViewport(prev => ({...prev, ...value})),
            },
            export: {
                projectJson: exportJson,
            },
        } : null,
    };
}


/** Returns the first unused sprite id like `sprite-0`, `sprite-1`, ... */
function generateSpriteId(existingIds: string[]): string {
    let index = 0;
    let id: string;
    do {
        id = `sprite-${index}`;
        index++;
    } while (existingIds.includes(id));
    return id;
}

/** Parses an annotation value typed into a text field: tries JSON first, falls back to plain text. */
function parseAnnotationValue(text: string): AnnotationValue {
    const trimmed = text.trim();
    if (trimmed.length === 0) {
        return text;
    }
    try {
        return JSON.parse(trimmed) as AnnotationValue;
    } catch {
        return text;
    }
}