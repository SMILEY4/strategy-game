import {useCallback, useState} from "react";
import type {AnnotationValue, Rect, Size, SpriteRegion} from "./atlas.types.ts";
import {clampRectToImage} from "./atlas.geometry.ts";
import {exportManifest, generateSpriteId, manifestToSprites, parseAnnotationValue, parseManifestJson} from "./atlas.serialization.ts";
import {createImageFromDataUrl, readFileAsDataUrl} from "./atlas.io.ts";

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
        if (sprite.id !== id) {
            return sprite;
        }
        const annotations = update(sprite.annotations);
        return annotations === sprite.annotations ? sprite : {...sprite, annotations};
    });
}

/** Editor state and actions: current image, sprites, selection, annotations, and export. */
export function useAtlasEditor() {
    const [atlasName, setAtlasName] = useState("atlas");
    const [imageName, setImageName] = useState("");
    const [loadedImage, setLoadedImage] = useState<LoadedImage | null>(null);
    const [sprites, setSprites] = useState<SpriteRegion[]>([]);
    const [selectedSpriteId, setSelectedSpriteId] = useState<string | null>(null);

    const image = loadedImage?.element ?? null;
    const imageSize = loadedImage?.size ?? {width: 0, height: 0};

    /** Loads a new image, resetting all sprites. */
    const loadImageDataUrl = useCallback(async (dataUrl: string, name?: string) => {
        const element = await createImageFromDataUrl(dataUrl);
        setLoadedImage({element, size: {width: element.naturalWidth, height: element.naturalHeight}});
        setSprites([]);
        setSelectedSpriteId(null);
        if (name) {
            setImageName(name);
        }
    }, []);

    const loadImageFile = useCallback(async (file: File) => {
        const dataUrl = await readFileAsDataUrl(file);
        await loadImageDataUrl(dataUrl, file.name);
    }, [loadImageDataUrl]);

    /** Loads a project JSON file, replacing the current sprite set. Requires an image. */
    const applyProjectJson = useCallback((json: string) => {
        if (!image) {
            throw new Error("Load an image first");
        }
        const manifest = parseManifestJson(json);
        setSprites(manifestToSprites(manifest, imageSize));
        setSelectedSpriteId(null);
        setAtlasName(manifest.atlas.name);
        setImageName(manifest.atlas.image);
    }, [image, imageSize]);

    /** Serializes the current editor state to a JSON string. */
    const exportJson = useCallback((): string => {
        if (!image) {
            throw new Error("No image loaded");
        }
        return exportManifest({atlasName, imageName, imageSize, sprites});
    }, [atlasName, imageName, image, imageSize, sprites]);

    const createSprite = useCallback((region: Rect) => {
        const clamped = clampRectToImage(region, imageSize);
        const id = generateSpriteId(sprites.map(sprite => sprite.id));
        setSprites(prev => [...prev, {id, name: id, ...clamped, annotations: {}}]);
        setSelectedSpriteId(id);
    }, [imageSize, sprites]);

    const updateSprite = useCallback((id: string, patch: Partial<Rect>) => {
        setSprites(prev => prev.map(sprite => sprite.id === id ? {...sprite, ...patch} : sprite));
    }, []);

    const updateSpriteMeta = useCallback((id: string, patch: Partial<Pick<SpriteRegion, "id" | "name">>) => {
        const target = sprites.find(sprite => sprite.id === id);
        if (!target) {
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
        setSprites(prev => withoutSprite(prev, id));
        setSelectedSpriteId(current => current === id ? null : current);
    }, []);

    const selectSprite = useCallback((id: string | null) => {
        setSelectedSpriteId(id);
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
        atlasName,
        setAtlasName,
        imageName,
        setImageName,
        image,
        imageSize,
        sprites,
        selectedSpriteId,
        loadImageDataUrl,
        loadImageFile,
        applyProjectJson,
        exportJson,
        createSprite,
        updateSprite,
        updateSpriteMeta,
        deleteSprite,
        selectSprite,
        addAnnotation,
        updateAnnotationKey,
        updateAnnotationValue,
        removeAnnotation,
    };
}

export type AtlasEditor = ReturnType<typeof useAtlasEditor>;
