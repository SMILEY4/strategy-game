import type {AtlasManifest, ParameterDef, Size, SpriteManifestEntry, SpriteRegion} from "./atlas.types.ts";
import {clampRectToImage, computeUvCoords} from "./atlas.geometry.ts";
import {isParameterType, normalizeAttributes} from "./atlas.parameters.ts";

export interface AtlasManifestSource {
    atlasName: string;
    imageSize: Size;
    layers: string[];
    parameters: ParameterDef[];
    sprites: SpriteRegion[];
}


/** Converts editor state into an `AtlasManifest` (adds UV coordinates per sprite). */
export function buildManifest(source: AtlasManifestSource): AtlasManifest {
    return {
        atlas: {
            name: source.atlasName,
            imageSize: source.imageSize,
            layers: source.layers,
        },
        parameters: source.parameters,
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

    const layers = Array.isArray(atlas.layers)
        ? atlas.layers.filter((name): name is string => typeof name === "string" && name.trim().length > 0)
        : [];

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
                locked: asBoolean(entry.locked, false),
                attributes: normalizeAttributes(rawAttributes as Partial<Record<string, unknown>>, parameters),
            });
        });
    }

    return {
        atlas: {
            name: asString(atlas.name, "atlas"),
            imageSize,
            layers,
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
            locked: entry.locked,
            attributes: normalizeAttributes(entry.attributes, manifest.parameters),
            ...rect,
        };
    });
}
