export type AtlasTool = "Select" | "Draw" | "Pan";

/** Compass direction of a region's edge/corner resize handle. */
export type ResizeHandle = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";

/** Canvas background style behind the sprite sheet image. */
export type BackgroundMode = "fill-dark" | "fill-medium" | "fill-light" | "checkerboard";

export type AnnotationValue = string | number | boolean | null | AnnotationValue[] | { [key: string]: AnnotationValue };

export interface Point {
    x: number;
    y: number;
}

export interface Size {
    width: number;
    height: number;
}

export interface Rect extends Size {
    x: number;
    y: number;
}

/** Zoom level plus the top-left pan offset of the canvas view. */
export interface Viewport {
    zoom: number;
    x: number;
    y: number;
}

/** A single image layer of the sprite sheet. All layers share the same pixel size. */
export interface AtlasLayer {
    id: string;
    name: string;
    element: HTMLImageElement;
    size: Size;
}

/** A sprite region in the editor: pixel rect plus a unique id, name, and annotations. */
export interface SpriteRegion extends Rect {
    id: string;
    name: string;
    locked: boolean;
}

/** A sprite as stored in the exported manifest, additionally with UV coordinates (0..1). */
export interface SpriteManifestEntry extends SpriteRegion {
    u: number;
    v: number;
    uw: number;
    vh: number;
}

/** Top-level structure of the exported JSON file. */
export interface AtlasManifest {
    atlas: {
        name: string;
        imageSize: Size;
        layers: string[];
    };
    sprites: SpriteManifestEntry[];
}
