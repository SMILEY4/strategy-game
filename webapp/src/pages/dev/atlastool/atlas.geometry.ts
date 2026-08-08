import type {Rect} from "./atlas.types.ts";

export type ResizeHandle = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";

export const RESIZE_HANDLES: ResizeHandle[] = ["nw", "n", "ne", "e", "se", "s", "sw", "w"];

export const MIN_ZOOM = 0.05;
export const MAX_ZOOM = 32;
export const ZOOM_LEVEL_STEP = 0.25;

export function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

export function clampZoom(zoom: number): number {
    return clamp(zoom, MIN_ZOOM, MAX_ZOOM);
}

/** Zoom expressed on a logarithmic (base 2) scale, so equal level steps are equal perceived steps. */
export function zoomToLevel(zoom: number): number {
    return Math.log2(zoom);
}

export function zoomFromLevel(level: number): number {
    return clamp(Math.pow(2, level), MIN_ZOOM, MAX_ZOOM);
}

export function snapPoint(p: { x: number, y: number }): { x: number, y: number } {
    return {x: Math.round(p.x), y: Math.round(p.y)};
}

export function clampPointToImage(p: { x: number, y: number }, imageWidth: number, imageHeight: number): { x: number, y: number } {
    return {
        x: clamp(p.x, 0, Math.max(0, imageWidth - 1)),
        y: clamp(p.y, 0, Math.max(0, imageHeight - 1)),
    };
}

export function normalizeRect(a: { x: number, y: number }, b: { x: number, y: number }): Rect {
    return {
        x: Math.min(a.x, b.x),
        y: Math.min(a.y, b.y),
        width: Math.abs(a.x - b.x) + 1,
        height: Math.abs(a.y - b.y) + 1,
    };
}

export function clampRectToImage(rect: Rect, imageWidth: number, imageHeight: number): Rect {
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
    x = clamp(x, 0, Math.max(0, imageWidth - 1));
    y = clamp(y, 0, Math.max(0, imageHeight - 1));
    width = clamp(width, 1, Math.max(1, imageWidth - x));
    height = clamp(height, 1, Math.max(1, imageHeight - y));
    return {x, y, width, height};
}

export function clampMove(region: Rect, dx: number, dy: number, imageWidth: number, imageHeight: number): Rect {
    return {
        ...region,
        x: clamp(region.x + Math.round(dx), 0, Math.max(0, imageWidth - region.width)),
        y: clamp(region.y + Math.round(dy), 0, Math.max(0, imageHeight - region.height)),
    };
}

export function clampResize(region: Rect, handle: ResizeHandle, point: { x: number, y: number }, imageWidth: number, imageHeight: number): Rect {
    const px = Math.round(point.x);
    const py = Math.round(point.y);
    let nx = region.x;
    let ny = region.y;
    let nw = region.width;
    let nh = region.height;

    if (handle.includes("w")) {
        nw = region.x + region.width - px;
        nx = px;
    }
    if (handle.includes("e")) {
        nw = px - region.x;
    }
    if (handle.includes("n")) {
        nh = region.y + region.height - py;
        ny = py;
    }
    if (handle.includes("s")) {
        nh = py - region.y;
    }

    if (nx < 0) {
        nw += nx;
        nx = 0;
    }
    if (ny < 0) {
        nh += ny;
        ny = 0;
    }
    nw = clamp(nw, 1, Math.max(1, imageWidth - nx));
    nh = clamp(nh, 1, Math.max(1, imageHeight - ny));

    return {x: nx, y: ny, width: nw, height: nh};
}

export function computeNormalized(region: Rect, imageWidth: number, imageHeight: number): { u: number, v: number, uw: number, vh: number } {
    return {
        u: imageWidth > 0 ? region.x / imageWidth : 0,
        v: imageHeight > 0 ? region.y / imageHeight : 0,
        uw: imageWidth > 0 ? region.width / imageWidth : 0,
        vh: imageHeight > 0 ? region.height / imageHeight : 0,
    };
}
