export type AtlasTool = "select" | "draw" | "pan";

export type AnnotationValue = string | number | boolean | null | AnnotationValue[] | { [key: string]: AnnotationValue };

export interface Rect {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface SpriteRegion extends Rect {
    id: string;
    name: string;
    annotations: Record<string, AnnotationValue>;
}

export interface SpriteManifestEntry extends SpriteRegion {
    u: number;
    v: number;
    uw: number;
    vh: number;
}

export interface AtlasManifest {
    atlas: {
        name: string;
        image: string;
        imageSize: { width: number, height: number };
    };
    sprites: SpriteManifestEntry[];
}
