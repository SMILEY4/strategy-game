import type {AnnotationValue, AtlasManifest, SpriteManifestEntry, SpriteRegion} from "./atlas.types.ts";
import {clampRectToImage, computeNormalized} from "./atlas.geometry.ts";

export interface AtlasManifestSource {
    atlasName: string;
    imageName: string;
    imageWidth: number;
    imageHeight: number;
    sprites: SpriteRegion[];
}

export function generateSpriteId(existingIds: string[]): string {
    let index = 0;
    let id: string;
    do {
        id = `sprite-${index}`;
        index++;
    } while (existingIds.includes(id));
    return id;
}

export function parseAnnotationValue(text: string): AnnotationValue {
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

export function buildManifest(source: AtlasManifestSource): AtlasManifest {
    return {
        atlas: {
            name: source.atlasName,
            image: source.imageName,
            imageSize: {width: source.imageWidth, height: source.imageHeight},
        },
        sprites: source.sprites.map(sprite => ({
            ...sprite,
            ...computeNormalized(sprite, source.imageWidth, source.imageHeight),
        })),
    };
}

export function exportManifest(source: AtlasManifestSource): string {
    return JSON.stringify(buildManifest(source), null, 2);
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isAnnotationValue(value: unknown): value is AnnotationValue {
    if (value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
        return true;
    }
    if (Array.isArray(value)) {
        return value.every(isAnnotationValue);
    }
    if (isRecord(value)) {
        return Object.values(value).every(isAnnotationValue);
    }
    return false;
}

export function parseManifestJson(json: string): AtlasManifest {
    let raw: unknown;
    try {
        raw = JSON.parse(json);
    } catch {
        throw new Error("Invalid JSON");
    }
    if (!isRecord(raw)) {
        throw new Error("File has no root object");
    }

    const atlas = isRecord(raw.atlas) ? raw.atlas : {};
    const name = typeof atlas.name === "string" ? atlas.name : "atlas";
    const image = typeof atlas.image === "string" ? atlas.image : "atlas";
    const imageSize = isRecord(atlas.imageSize) ? atlas.imageSize : {};
    const imageWidth = typeof imageSize.width === "number" && imageSize.width > 0 ? Math.round(imageSize.width) : 0;
    const imageHeight = typeof imageSize.height === "number" && imageSize.height > 0 ? Math.round(imageSize.height) : 0;

    const sprites: SpriteManifestEntry[] = [];
    if (Array.isArray(raw.sprites)) {
        raw.sprites.forEach((entry, index) => {
            if (!isRecord(entry)) {
                return;
            }
            const annotations: Record<string, AnnotationValue> = {};
            if (isRecord(entry.annotations)) {
                for (const [key, value] of Object.entries(entry.annotations)) {
                    if (isAnnotationValue(value)) {
                        annotations[key] = value;
                    }
                }
            }
            sprites.push({
                id: typeof entry.id === "string" && entry.id.trim() ? entry.id : `sprite-${index}`,
                name: typeof entry.name === "string" ? entry.name : `Sprite ${index + 1}`,
                x: typeof entry.x === "number" ? Math.round(entry.x) : 0,
                y: typeof entry.y === "number" ? Math.round(entry.y) : 0,
                width: typeof entry.width === "number" ? Math.round(entry.width) : 0,
                height: typeof entry.height === "number" ? Math.round(entry.height) : 0,
                annotations,
                u: typeof entry.u === "number" ? entry.u : 0,
                v: typeof entry.v === "number" ? entry.v : 0,
                uw: typeof entry.uw === "number" ? entry.uw : 0,
                vh: typeof entry.vh === "number" ? entry.vh : 0,
            });
        });
    }

    return {atlas: {name, image, imageSize: {width: imageWidth, height: imageHeight}}, sprites};
}

export function manifestToSprites(manifest: AtlasManifest, imageWidth: number, imageHeight: number): SpriteRegion[] {
    return manifest.sprites.map(entry => {
        const hasPixelRect = entry.width > 0 && entry.height > 0;
        const rect = clampRectToImage(
            hasPixelRect
                ? {x: entry.x, y: entry.y, width: entry.width, height: entry.height}
                : {
                    x: Math.round(entry.u * imageWidth),
                    y: Math.round(entry.v * imageHeight),
                    width: Math.round(entry.uw * imageWidth),
                    height: Math.round(entry.vh * imageHeight),
                },
            imageWidth,
            imageHeight,
        );
        return {
            id: entry.id,
            name: entry.name,
            annotations: entry.annotations,
            ...rect,
        };
    });
}
