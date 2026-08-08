import {useCallback, useState} from "react";
import type {Rect, SpriteRegion} from "./atlas.types.ts";
import {clampRectToImage} from "./atlas.geometry.ts";
import {exportManifest, generateSpriteId, manifestToSprites, parseAnnotationValue, parseManifestJson} from "./atlas.serialization.ts";

function readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("Could not read file"));
        reader.readAsDataURL(file);
    });
}

function createImageFromDataUrl(dataUrl: string): Promise<{ image: HTMLImageElement, width: number, height: number }> {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve({image, width: image.naturalWidth, height: image.naturalHeight});
        image.onerror = () => reject(new Error("Could not load image"));
        image.src = dataUrl;
    });
}

function withoutSprite(sprites: SpriteRegion[], id: string): SpriteRegion[] {
    return sprites.filter(sprite => sprite.id !== id);
}

export interface AtlasEditor {
    atlasName: string,
    setAtlasName: (name: string) => void,
    imageName: string,
    setImageName: (name: string) => void,
    image: HTMLImageElement | null,
    imageWidth: number,
    imageHeight: number,
    sprites: SpriteRegion[],
    selectedSpriteId: string | null,
    loadImageDataUrl: (dataUrl: string, name?: string) => Promise<void>,
    loadImageFile: (file: File) => Promise<void>,
    applyProjectJson: (json: string) => void,
    exportJson: () => string,
    createSprite: (region: Rect) => void,
    updateSprite: (id: string, region: Rect) => void,
    updateSpriteMeta: (id: string, patch: Partial<Pick<SpriteRegion, "id" | "name">>) => void,
    deleteSprite: (id: string) => void,
    selectSprite: (id: string | null) => void,
    addAnnotation: (id: string, key: string) => void,
    updateAnnotationKey: (id: string, oldKey: string, newKey: string) => void,
    updateAnnotationValue: (id: string, key: string, text: string) => void,
    removeAnnotation: (id: string, key: string) => void,
}

export function useAtlasEditor(): AtlasEditor {
    const [atlasName, setAtlasName] = useState("atlas");
    const [imageName, setImageName] = useState("");
    const [image, setImage] = useState<HTMLImageElement | null>(null);
    const [imageWidth, setImageWidth] = useState(0);
    const [imageHeight, setImageHeight] = useState(0);
    const [sprites, setSprites] = useState<SpriteRegion[]>([]);
    const [selectedSpriteId, setSelectedSpriteId] = useState<string | null>(null);

    const loadImageDataUrl = useCallback(async (dataUrl: string, name?: string) => {
        const loaded = await createImageFromDataUrl(dataUrl);
        setImage(loaded.image);
        setImageWidth(loaded.width);
        setImageHeight(loaded.height);
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

    const applyProjectJson = useCallback((json: string) => {
        if (!image) {
            throw new Error("Load an image first");
        }
        const manifest = parseManifestJson(json);
        setSprites(manifestToSprites(manifest, imageWidth, imageHeight));
        setSelectedSpriteId(null);
        setAtlasName(manifest.atlas.name);
        setImageName(manifest.atlas.image);
    }, [image, imageWidth, imageHeight]);

    const exportJson = useCallback((): string => {
        if (!image) {
            throw new Error("No image loaded");
        }
        return exportManifest({atlasName, imageName, imageWidth, imageHeight, sprites});
    }, [atlasName, imageName, image, imageWidth, imageHeight, sprites]);

    const createSprite = useCallback((region: Rect) => {
        const clamped = clampRectToImage(region, imageWidth, imageHeight);
        const id = generateSpriteId(sprites.map(sprite => sprite.id));
        setSprites(prev => [...prev, {id, name: id, ...clamped, annotations: {}}]);
        setSelectedSpriteId(id);
    }, [imageWidth, imageHeight, sprites]);

    const updateSprite = useCallback((id: string, region: Rect) => {
        setSprites(prev => prev.map(sprite => sprite.id === id ? {...sprite, ...region} : sprite));
    }, []);

    const updateSpriteMeta = useCallback((id: string, patch: Partial<Pick<SpriteRegion, "id" | "name">>) => {
        const target = sprites.find(sprite => sprite.id === id);
        if (!target) {
            return;
        }
        const nextId = patch.id !== undefined && patch.id.trim()
            ? patch.id
            : target.id;
        const collides = nextId !== target.id && sprites.some(sprite => sprite.id === nextId);
        const effectivePatch: Partial<Pick<SpriteRegion, "id" | "name">> = {};
        if (!collides) {
            effectivePatch.id = nextId;
        }
        if (patch.name !== undefined) {
            effectivePatch.name = patch.name;
        }
        if (Object.keys(effectivePatch).length === 0) {
            return;
        }
        setSprites(prev => prev.map(sprite => sprite.id === id ? {...sprite, ...effectivePatch} : sprite));
        if (effectivePatch.id) {
            setSelectedSpriteId(current => current === id ? effectivePatch.id! : current);
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
        setSprites(prev => prev.map(sprite => {
            if (sprite.id !== id || key in sprite.annotations) {
                return sprite;
            }
            return {...sprite, annotations: {...sprite.annotations, [key]: ""}};
        }));
    }, []);

    const updateAnnotationKey = useCallback((id: string, oldKey: string, newKey: string) => {
        if (!newKey.trim() || newKey === oldKey) {
            return;
        }
        setSprites(prev => prev.map(sprite => {
            if (sprite.id !== id || !(oldKey in sprite.annotations)) {
                return sprite;
            }
            const annotations = {...sprite.annotations};
            const value = annotations[oldKey];
            delete annotations[oldKey];
            annotations[newKey] = value;
            return {...sprite, annotations};
        }));
    }, []);

    const updateAnnotationValue = useCallback((id: string, key: string, text: string) => {
        const value = parseAnnotationValue(text);
        setSprites(prev => prev.map(sprite => {
            if (sprite.id !== id || !(key in sprite.annotations)) {
                return sprite;
            }
            return {...sprite, annotations: {...sprite.annotations, [key]: value}};
        }));
    }, []);

    const removeAnnotation = useCallback((id: string, key: string) => {
        setSprites(prev => prev.map(sprite => {
            if (sprite.id !== id || !(key in sprite.annotations)) {
                return sprite;
            }
            const annotations = {...sprite.annotations};
            delete annotations[key];
            return {...sprite, annotations};
        }));
    }, []);

    return {
        atlasName,
        setAtlasName,
        imageName,
        setImageName,
        image,
        imageWidth,
        imageHeight,
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
