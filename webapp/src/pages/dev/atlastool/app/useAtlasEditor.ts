import {useCallback, useMemo, useState} from "react";
import type {AnnotationValue, AtlasLayer, AtlasManifest, AtlasTool, Rect, SpriteRegion, Viewport} from "./atlas.types.ts";
import {clampRectToImage} from "./atlas.geometry.ts";
import {exportManifest, manifestToSprites, parseManifestJson} from "./atlas.serialization.ts";
import {createImageFromDataUrl, downloadJson, fileNameWithoutExtension, readFileAsDataUrl} from "./atlas.io.ts";
import type {AtlasEditor} from "@pages/dev/atlastool/app/atlas.editor.ts";

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

/** Editor state and actions: image layers, sprites, selection, annotations, and export. */
export function useAtlasEditor(): AtlasEditor {
    const [atlasName, setAtlasName] = useState("atlas");
    const [images, setImages] = useState<AtlasLayer[]>([]);
    const [activeImageId, setActiveImageId] = useState<string | null>(null);
    const [sprites, setSprites] = useState<SpriteRegion[]>([]);
    const [selectedSpriteId, setSelectedSpriteId] = useState<string | null>(null);
    const [tool, setTool] = useState<AtlasTool>("select");
    const [viewport, setViewport] = useState<Viewport>(INITIAL_VIEWPORT);

    const activeImage = images.find(layer => layer.id === activeImageId) ?? images[0] ?? null;
    const imageSize = useMemo(() => activeImage?.size ?? {width: 0, height: 0}, [activeImage]);

    const selectedSprite = selectedSpriteId
        ? sprites.find(sprite => sprite.id === selectedSpriteId) ?? null
        : null;

    //=========== PROJECT ===============================================================

    /** Opens a new project from a set of image files (one per layer) and an optional project JSON. */
    const openProject = useCallback(async (imageFiles: File[], projectJson: string | null) => {
        if (imageFiles.length === 0) {
            throw new Error("Add at least one image");
        }
        const decoded = await decodeLayerFiles(imageFiles);

        const size = decoded[0].size;
        for (const layer of decoded) {
            if (layer.size.width !== size.width || layer.size.height !== size.height) {
                throw new Error(`Images must all be the same size (found ${size.width}×${size.height} and ${layer.size.width}×${layer.size.height})`);
            }
        }

        let manifest: AtlasManifest | null = null;
        if (projectJson) {
            manifest = parseManifestJson(projectJson);
            if (manifest.atlas.imageSize.width > 0 &&
                (manifest.atlas.imageSize.width !== size.width || manifest.atlas.imageSize.height !== size.height)) {
                throw new Error(`Project image size is ${manifest.atlas.imageSize.width}×${manifest.atlas.imageSize.height}, but the selected images are ${size.width}×${size.height}`);
            }
            decoded.forEach((layer, index) => {
                const manifestName = manifest!.atlas.layers[index];
                if (manifestName) {
                    layer.name = manifestName;
                }
            });
        }

        const newImages = ensureUniqueLayerNames(decoded).map(layer => ({...layer, id: createSpriteId()}));
        setImages(newImages);
        setActiveImageId(newImages[0].id);
        setSprites(manifest ? manifestToSprites(manifest, size) : []);
        setSelectedSpriteId(null);
        setAtlasName(manifest?.atlas.name || fileNameWithoutExtension(imageFiles[0].name));
        setViewport(INITIAL_VIEWPORT);
    }, []);

    /** Loads a project JSON file, replacing the current sprite set. Requires images. */
    const applyProjectJson = useCallback((json: string) => {
        if (images.length === 0) {
            throw new Error("Open a project with at least one image first");
        }
        const manifest = parseManifestJson(json);
        if (manifest.atlas.imageSize.width > 0 &&
            (manifest.atlas.imageSize.width !== imageSize.width || manifest.atlas.imageSize.height !== imageSize.height)) {
            throw new Error(`Project image size is ${manifest.atlas.imageSize.width}×${manifest.atlas.imageSize.height}, but the current image is ${imageSize.width}×${imageSize.height}`);
        }
        setSprites(manifestToSprites(manifest, imageSize));
        setSelectedSpriteId(null);
        setAtlasName(manifest.atlas.name);
    }, [images, imageSize]);

    //=========== IMAGE LAYERS =========================================================

    /** Adds one or more images as new layers, rejecting images whose size differs. */
    const addImages = useCallback(async (files: File[]) => {
        if (files.length === 0) {
            return;
        }
        const decoded = await decodeLayerFiles(files);
        const commonSize = images[0]?.size;
        if (commonSize) {
            for (const layer of decoded) {
                if (layer.size.width !== commonSize.width || layer.size.height !== commonSize.height) {
                    throw new Error(`Image "${layer.name}" is ${layer.size.width}×${layer.size.height}; expected ${commonSize.width}×${commonSize.height}`);
                }
            }
        }
        const named = ensureUniqueLayerNames([...images, ...decoded]).slice(images.length);
        const newImages = named.map(layer => ({...layer, id: createSpriteId()}));
        setImages(prev => [...prev, ...newImages]);
        if (images.length === 0) {
            setActiveImageId(newImages[0].id);
        }
    }, [images]);

    /** Removes a layer. The last remaining layer cannot be removed. */
    const removeImage = useCallback((id: string) => {
        const index = images.findIndex(layer => layer.id === id);
        if (index < 0 || images.length <= 1) {
            return;
        }
        const next = images.filter(layer => layer.id !== id);
        setImages(next);
        if (activeImageId === id) {
            setActiveImageId(next[Math.min(index, next.length - 1)].id);
        }
    }, [images, activeImageId]);

    /** Makes the given layer the visible one. */
    const selectImage = useCallback((id: string) => {
        if (images.some(layer => layer.id === id)) {
            setActiveImageId(id);
        }
    }, [images]);

    /** Switches the visible layer by one step (wrapping around). */
    const cycleImage = useCallback((direction: 1 | -1) => {
        if (images.length === 0) {
            return;
        }
        const index = images.findIndex(layer => layer.id === activeImage?.id);
        const safeIndex = index < 0 ? 0 : index;
        const nextIndex = (safeIndex + direction + images.length) % images.length;
        setActiveImageId(images[nextIndex].id);
    }, [images, activeImage]);

    //=========== SPRITES ==============================================================

    const createSprite = useCallback((region: Rect) => {
        const clamped = clampRectToImage(region, imageSize);
        const id = createSpriteId();
        const name = nextSpriteName(sprites.map(sprite => sprite.name));
        setSprites(prev => [...prev, {id, name, ...clamped, annotations: {}, locked: false}]);
        setSelectedSpriteId(id);
    }, [imageSize, sprites]);

    const updateSprite = useCallback((id: string, patch: Partial<Rect>) => {
        setSprites(prev => prev.map(sprite => sprite.id === id && !sprite.locked ? {...sprite, ...patch} : sprite));
    }, []);

    const updateSpriteMeta = useCallback((id: string, patch: { name: string }) => {
        const target = sprites.find(sprite => sprite.id === id);
        if (!target || target.locked) {
            return;
        }
        setSprites(prev => prev.map(sprite => sprite.id === id ? {...sprite, name: patch.name} : sprite));
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

    //=========== EXPORT ===============================================================

    /** Serializes the current editor state to a JSON string and downloads it. */
    const exportJson = useCallback((): string => {
        if (images.length === 0) {
            throw new Error("No image loaded");
        }
        const content = exportManifest({
            atlasName,
            imageSize,
            layers: images.map(layer => layer.name),
            sprites,
        });
        downloadJson(`${atlasName || "atlas"}.json`, content);
        return content;
    }, [atlasName, imageSize, images, sprites]);

    return {
        load: {
            open: openProject,
            projectJson: applyProjectJson,
        },
        project: images.length > 0 ? {
            atlasName: {
                value: atlasName,
                set: setAtlasName,
            },
            images: {
                list: images,
                activeId: activeImage?.id ?? null,
                active: activeImage,
                size: imageSize,
                add: addImages,
                remove: removeImage,
                select: selectImage,
                cycle: cycleImage,
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


/** Decodes image files into layer descriptors (without id), naming them after their file names. */
async function decodeLayerFiles(files: File[]): Promise<Array<Omit<AtlasLayer, "id">>> {
    return Promise.all(files.map(async file => {
        const element = await createImageFromDataUrl(await readFileAsDataUrl(file));
        return {
            element,
            size: {width: element.naturalWidth, height: element.naturalHeight},
            name: fileNameWithoutExtension(file.name),
        };
    }));
}

/** Ensures every layer name is unique, appending `-2`, `-3`, ... to duplicates. */
function ensureUniqueLayerNames<T extends { name: string }>(layers: T[]): T[] {
    const used = new Set<string>();
    return layers.map(layer => {
        let name = layer.name;
        let counter = 2;
        while (used.has(name)) {
            name = `${layer.name}-${counter++}`;
        }
        used.add(name);
        return {...layer, name};
    });
}

/** Returns a random, practically-unique id for a new sprite or layer. */
function createSpriteId(): string {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }
    return `sprite-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Returns the first unused default name like `sprite-1`, `sprite-2`, ... */
function nextSpriteName(existingNames: string[]): string {
    let index = 0;
    let name: string;
    do {
        index++;
        name = `sprite-${index}`;
    } while (existingNames.includes(name));
    return name;
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
