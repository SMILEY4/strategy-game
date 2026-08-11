import type {
    AtlasManifest,
    ParameterDef,
    ParameterValue,
    Rect,
    Size,
    SpriteManifestEntry,
    SpriteRegion,
    UvRect,
} from "./atlas.types.ts";
import {clampRectToImage, computeNormalizedSize, computeUvCoords} from "./atlas.geometry.ts";
import {isParameterType, normalizeAttributes} from "./atlas.parameters.ts";

export interface AtlasManifestSource {
    atlasName: string;
    imageSize: Size;
    parameters: ParameterDef[];
    sprites: SpriteRegion[];
}

/** A sprite entry as it appears in the exported JSON file. */
interface SerializedSprite {
    id: string;
    name: string;
    size: Rect;
    uv: UvRect;
    normalized: Size;
    locked: boolean;
    attributes: Record<string, ParameterValue>;
}

/** Converts editor state into an `AtlasManifest` (adds UV coordinates and normalized size per sprite). */
export function buildManifest(source: AtlasManifestSource): AtlasManifest {
    return {
        atlas: {
            name: source.atlasName,
            imageSize: source.imageSize,
        },
        parameters: source.parameters,
        sprites: source.sprites.map(sprite => toManifestEntry(sprite, source.imageSize)),
    };
}

function toManifestEntry(sprite: SpriteRegion, imageSize: Size): SpriteManifestEntry {
    return {
        ...sprite,
        uv: computeUvCoords(sprite, imageSize),
        normalized: computeNormalizedSize(sprite),
    };
}

/** Serializes editor state to a pretty-printed JSON string for download. */
export function exportManifest(source: AtlasManifestSource): string {
    const manifest = buildManifest(source);
    return JSON.stringify({
        atlas: manifest.atlas,
        parameters: manifest.parameters,
        sprites: manifest.sprites.map(serializeSprite),
    }, null, 2);
}

function serializeSprite(entry: SpriteManifestEntry): SerializedSprite {
    return {
        id: entry.id,
        name: entry.name,
        size: {
            x: entry.x,
            y: entry.y,
            width: entry.width,
            height: entry.height,
        },
        uv: entry.uv,
        normalized: entry.normalized,
        locked: entry.locked,
        attributes: entry.attributes,
    };
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
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

function asBoolean(value: unknown, fallback: boolean): boolean {
    return typeof value === "boolean" ? value : fallback;
}

function asRoundedNumber(value: unknown, fallback: number): number {
    return typeof value === "number" ? Math.round(value) : fallback;
}

function asPositiveInt(value: unknown): number {
    return typeof value === "number" && value > 0 ? Math.round(value) : 0;
}

/** Reads a sprite's pixel rect, accepting either a nested `size` object or legacy flat x/y/width/height. */
function readSpriteRect(raw: Record<string, unknown>): { x: number, y: number, width: number, height: number } {
    const size = isRecord(raw.size) ? raw.size : raw;
    return {
        x: asRoundedNumber(size.x, 0),
        y: asRoundedNumber(size.y, 0),
        width: asRoundedNumber(size.width, 0),
        height: asRoundedNumber(size.height, 0),
    };
}

/** Reads a sprite's UVs, accepting either a nested `uv` object or legacy flat u/v/uw/vh. */
function readSpriteUv(raw: Record<string, unknown>): UvRect {
    if (isRecord(raw.uv)) {
        return {
            uMin: asNumber(raw.uv.uMin, 0),
            vMin: asNumber(raw.uv.vMin, 0),
            uMax: asNumber(raw.uv.uMax, 0),
            vMax: asNumber(raw.uv.vMax, 0),
        };
    }
    const u = asNumber(raw.u, 0);
    const v = asNumber(raw.v, 0);
    return {
        uMin: u,
        vMin: v,
        uMax: asNumber(raw.uw, 0) + u,
        vMax: asNumber(raw.vh, 0) + v,
    };
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

    const parameters: ParameterDef[] = [];
    if (Array.isArray(raw.parameters)) {
        raw.parameters.forEach((entry, index) => {
            if (!isRecord(entry)) {
                return;
            }
            const type = entry.type;
            parameters.push({
                id: asId(entry.id, `parameter-${index + 1}`),
                name: asString(entry.name, `Parameter ${index + 1}`),
                type: isParameterType(type) ? type : "string",
            });
        });
    }

    const sprites: SpriteManifestEntry[] = [];
    if (Array.isArray(raw.sprites)) {
        raw.sprites.forEach((entry, index) => {
            if (!isRecord(entry)) {
                return;
            }
            const rawAttributes = isRecord(entry.attributes) ? entry.attributes : null;
            const rect = readSpriteRect(entry);
            sprites.push({
                id: asId(entry.id, `sprite-${index}`),
                name: asString(entry.name, `Sprite ${index + 1}`),
                ...rect,
                uv: readSpriteUv(entry),
                normalized: computeNormalizedSize(rect),
                locked: asBoolean(entry.locked, false),
                attributes: normalizeAttributes(rawAttributes as Partial<Record<string, unknown>>, parameters),
            });
        });
    }

    return {
        atlas: {
            name: asString(atlas.name, "atlas"),
            imageSize,
        },
        parameters,
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
                    x: Math.round(entry.uv.uMin * imageSize.width),
                    y: Math.round(entry.uv.vMin * imageSize.height),
                    width: Math.round((entry.uv.uMax - entry.uv.uMin) * imageSize.width),
                    height: Math.round((entry.uv.vMax - entry.uv.vMin) * imageSize.height),
                },
            imageSize,
        );
        return {
            id: entry.id,
            name: entry.name,
            locked: entry.locked,
            attributes: normalizeAttributes(entry.attributes, manifest.parameters),
            ...rect,
        };
    });
}
