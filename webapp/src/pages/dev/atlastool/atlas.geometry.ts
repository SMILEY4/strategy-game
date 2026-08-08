import type {Point, Rect, ResizeHandle, Size, Viewport} from "./app/atlas.types.ts";

export const MIN_ZOOM = 0.05;
export const MAX_ZOOM = 32;
export const ZOOM_LEVEL_STEP = 0.25;

/** Pure math helpers for sprites, zoom and viewport mapping. */

export function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

/** Zoom on a logarithmic (base 2) scale so equal level steps are equal perceived steps. */
export function zoomToLevel(zoom: number): number {
    return Math.log2(zoom);
}

/** Inverse of `zoomToLevel`: converts a level back to a zoom, clamped to the allowed range. */
export function zoomFromLevel(level: number): number {
    return clamp(Math.pow(2, level), MIN_ZOOM, MAX_ZOOM);
}

/** Rounds a point to whole image pixels. */
export function snapPoint(p: Point): Point {
    return {x: Math.round(p.x), y: Math.round(p.y)};
}

/** Clamps a point so it stays inside the image bounds. */
export function clampPointToImage(p: Point, size: Size): Point {
    return {
        x: clamp(p.x, 0, Math.max(0, size.width - 1)),
        y: clamp(p.y, 0, Math.max(0, size.height - 1)),
    };
}

/** Builds a rect from two opposite corners (inclusive, min 1px). */
export function rectFromPoints(a: Point, b: Point): Rect {
    return {
        x: Math.min(a.x, b.x),
        y: Math.min(a.y, b.y),
        width: Math.abs(a.x - b.x) + 1,
        height: Math.abs(a.y - b.y) + 1,
    };
}

/** Clamps a rect so it stays fully inside the image bounds (keeps at least 1×1). */
export function clampRectToImage(rect: Rect, size: Size): Rect {
    let x = rect.x;
    let y = rect.y;
    let width = rect.width;
    let height = rect.height;
    if (x < 0) {
        width += x;
        x = 0;
    }
    if (y < 0) {
        height += y;
        y = 0;
    }
    x = clamp(x, 0, Math.max(0, size.width - 1));
    y = clamp(y, 0, Math.max(0, size.height - 1));
    width = clamp(width, 1, Math.max(1, size.width - x));
    height = clamp(height, 1, Math.max(1, size.height - y));
    return {x, y, width, height};
}

/** Moves a region by (dx, dy) pixels, keeping it inside the image. */
export function clampMove(region: Rect, dx: number, dy: number, size: Size): Rect {
    return {
        ...region,
        x: clamp(region.x + Math.round(dx), 0, Math.max(0, size.width - region.width)),
        y: clamp(region.y + Math.round(dy), 0, Math.max(0, size.height - region.height)),
    };
}

/** Resizes a region by dragging a corner/edge handle to a new point, keeping it in bounds. */
export function clampResize(region: Rect, handle: ResizeHandle, point: Point, size: Size): Rect {
    const px = Math.round(point.x);
    const py = Math.round(point.y);
    let x = region.x;
    let y = region.y;
    let width = region.width;
    let height = region.height;

    if (handle.includes("w")) {
        width = region.x + region.width - px;
        x = px;
    }
    if (handle.includes("e")) {
        width = px - region.x;
    }
    if (handle.includes("n")) {
        height = region.y + region.height - py;
        y = py;
    }
    if (handle.includes("s")) {
        height = py - region.y;
    }

    if (x < 0) {
        width += x;
        x = 0;
    }
    if (y < 0) {
        height += y;
        y = 0;
    }
    width = clamp(width, 1, Math.max(1, size.width - x));
    height = clamp(height, 1, Math.max(1, size.height - y));

    return {x, y, width, height};
}

/** Texture coordinates (0..1) of a region inside the image. */
export function computeUvCoords(region: Rect, size: Size): { u: number, v: number, uw: number, vh: number } {
    return {
        u: size.width > 0 ? region.x / size.width : 0,
        v: size.height > 0 ? region.y / size.height : 0,
        uw: size.width > 0 ? region.width / size.width : 0,
        vh: size.height > 0 ? region.height / size.height : 0,
    };
}

// Viewport mapping (image coordinates <-> canvas coordinates).

/** Converts an image-space point to canvas/screen coordinates. */
export function toScreenPoint(p: Point, viewport: Viewport): Point {
    return {x: viewport.x + p.x * viewport.zoom, y: viewport.y + p.y * viewport.zoom};
}

/** Converts a canvas/screen point back to image space. */
export function toImagePoint(p: Point, viewport: Viewport): Point {
    return {x: (p.x - viewport.x) / viewport.zoom, y: (p.y - viewport.y) / viewport.zoom};
}

/** Converts an image-space rect to a screen rect (position scaled and offset by the viewport). */
export function toScreenRect(region: Rect, viewport: Viewport): Rect {
    const origin = toScreenPoint(region, viewport);
    return {x: origin.x, y: origin.y, width: region.width * viewport.zoom, height: region.height * viewport.zoom};
}
