import type {AnnotationValue, AtlasManifest, Size, SpriteManifestEntry, SpriteRegion} from "./atlas.types.ts";
import {clampRectToImage, computeUvCoords} from "./atlas.geometry.ts";

export interface AtlasManifestSource {
    atlasName: string;
    imageName: string;
    imageSize: Size;
    sprites: SpriteRegion[];
}

/** Builds and parses the exported atlas JSON manifest. */

/** Returns the first unused sprite id like `sprite-0`, `sprite-1`, ... */
export function generateSpriteId(existingIds: string[]): string {
    let index = 0;
    let id: string;
    do {
        id = `sprite-${index}`;
        index++;
    } while (existingIds.includes(id));
    return id;
}

/** Parses an annotation value typed into a text field: tries JSON first, falls back to plain text. */
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

/** Converts editor state into an `AtlasManifest` (adds UV coordinates per sprite). */
export function buildManifest(source: AtlasManifestSource): AtlasManifest {
    return {
        atlas: {
            name: source.atlasName,
            image: source.imageName,
            imageSize: source.imageSize,
        },
        sprites: source.sprites.map(sprite => ({
            ...sprite,
            ...computeUvCoords(sprite, source.imageSize),
        })),
    };
}

/** Serializes editor state to a pretty-printed JSON string for download. */
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

function parseAnnotations(raw: unknown): Record<string, AnnotationValue> {
    const annotations: Record<string, AnnotationValue> = {};
    if (isRecord(raw)) {
        for (const [key, value] of Object.entries(raw)) {
            if (isAnnotationValue(value)) {
                annotations[key] = value;
            }
        }
    }
    return annotations;
}

function asString(value: unknown, fallback: string): string {
    return typeof value === "string" ? value : fallback;
}

function asId(value: unknown, fallback: string): string {
    return typeof value === "string" && value.trim() ? value : fallback;
}

function asNumber(value: unknown, fallback: number): number {
    return typeof value === "number" ? value : fallback;
}

function asRoundedNumber(value: unknown, fallback: number): number {
    return typeof value === "number" ? Math.round(value) : fallback;
}

function asPositiveInt(value: unknown): number {
    return typeof value === "number" && value > 0 ? Math.round(value) : 0;
}

/** Parses a manifest JSON string, tolerating missing/wrong fields. Throws on invalid JSON. */
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
    const imageSizeRaw = isRecord(atlas.imageSize) ? atlas.imageSize : {};
    const imageSize: Size = {
        width: asPositiveInt(imageSizeRaw.width),
        height: asPositiveInt(imageSizeRaw.height),
    };

    const sprites: SpriteManifestEntry[] = [];
    if (Array.isArray(raw.sprites)) {
        raw.sprites.forEach((entry, index) => {
            if (!isRecord(entry)) {
                return;
            }
            sprites.push({
                id: asId(entry.id, `sprite-${index}`),
                name: asString(entry.name, `Sprite ${index + 1}`),
                x: asRoundedNumber(entry.x, 0),
                y: asRoundedNumber(entry.y, 0),
                width: asRoundedNumber(entry.width, 0),
                height: asRoundedNumber(entry.height, 0),
                u: asNumber(entry.u, 0),
                v: asNumber(entry.v, 0),
                uw: asNumber(entry.uw, 0),
                vh: asNumber(entry.vh, 0),
                annotations: parseAnnotations(entry.annotations),
            });
        });
    }

    return {
        atlas: {
            name: asString(atlas.name, "atlas"),
            image: asString(atlas.image, "atlas"),
            imageSize,
        },
        sprites,
    };
}

/** Converts a parsed manifest into editor sprite regions, recovering pixel rects from UVs if needed. */
export function manifestToSprites(manifest: AtlasManifest, imageSize: Size): SpriteRegion[] {
    return manifest.sprites.map(entry => {
        const hasPixelRect = entry.width > 0 && entry.height > 0;
        const rect = clampRectToImage(
            hasPixelRect
                ? {x: entry.x, y: entry.y, width: entry.width, height: entry.height}
                : {
                    x: Math.round(entry.u * imageSize.width),
                    y: Math.round(entry.v * imageSize.height),
                    width: Math.round(entry.uw * imageSize.width),
                    height: Math.round(entry.vh * imageSize.height),
                },
            imageSize,
        );
        return {
            id: entry.id,
            name: entry.name,
            annotations: entry.annotations,
            ...rect,
        };
    });
}
