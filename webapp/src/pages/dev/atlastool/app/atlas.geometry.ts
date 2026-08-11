import type {Point, Rect, ResizeHandle, Size, SpriteRegion, UvRect, Viewport} from "./atlas.types.ts";

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
export function computeUvCoords(region: Rect, size: Size): UvRect {
    return {
        uMin: size.width > 0 ? region.x / size.width : 0,
        vMin: size.height > 0 ? region.y / size.height : 0,
        uMax: size.width > 0 ? (region.x + region.width) / size.width : 0,
        vMax: size.height > 0 ? (region.y + region.height) / size.height : 0,
    };
}

/** Normalized sprite size (aspect ratio): the larger side is 1, the smaller side is its fraction. */
export function computeNormalizedSize(size: Size): Size {
    const max = Math.max(size.width, size.height);
    if (max <= 0) return {width: 0, height: 0};
    return {
        width: size.width / max,
        height: size.height / max,
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

/** Returns a viewport zoomed to `nextZoom`, keeping the image point under `anchor` (screen coords) fixed. */
export function zoomAt(viewport: Viewport, anchor: Point, nextZoom: number): Viewport {
    const scale = nextZoom / viewport.zoom;
    return {
        zoom: nextZoom,
        x: anchor.x - (anchor.x - viewport.x) * scale,
        y: anchor.y - (anchor.y - viewport.y) * scale,
    };
}

/** Returns a viewport that fits the whole image into the canvas, centered. */
export function fitViewport(canvasSize: Size, imageSize: Size): Viewport {
    if (canvasSize.width <= 0 || canvasSize.height <= 0 || imageSize.width <= 0 || imageSize.height <= 0) {
        return {zoom: 1, x: 40, y: 40};
    }
    const zoom = clamp(
        Math.min(canvasSize.width / imageSize.width, canvasSize.height / imageSize.height),
        MIN_ZOOM,
        MAX_ZOOM,
    );
    return {
        zoom,
        x: (canvasSize.width - imageSize.width * zoom) / 2,
        y: (canvasSize.height - imageSize.height * zoom) / 2,
    };
}

export function toScreen(event: { clientX: number, clientY: number }, canvas: HTMLCanvasElement): Point {
    const rect = canvas.getBoundingClientRect();
    return {x: event.clientX - rect.left, y: event.clientY - rect.top};
}

export function toImage(event: { clientX: number, clientY: number }, canvas: HTMLCanvasElement, viewport: Viewport): Point {
    return toImagePoint(toScreen(event, canvas), viewport);
}

/** Returns which resize edge/corner of a region a screen point is over, or null. */
export function hitTestEdge(screen: Point, region: Rect, viewport: Viewport): ResizeHandle | null {
    const EDGE_THRESHOLD = 6;
    const rect = toScreenRect(region, viewport);
    const x0 = rect.x;
    const y0 = rect.y;
    const x1 = rect.x + rect.width;
    const y1 = rect.y + rect.height;
    const pad = EDGE_THRESHOLD;

    let xSide: "" | "w" | "e" = "";
    let ySide: "" | "n" | "s" = "";
    if (screen.x >= x0 - pad && screen.x <= x0 + pad && screen.y >= y0 - pad && screen.y <= y1 + pad) {
        xSide = "w";
    } else if (screen.x >= x1 - pad && screen.x <= x1 + pad && screen.y >= y0 - pad && screen.y <= y1 + pad) {
        xSide = "e";
    }
    if (screen.y >= y0 - pad && screen.y <= y0 + pad && screen.x >= x0 - pad && screen.x <= x1 + pad) {
        ySide = "n";
    } else if (screen.y >= y1 - pad && screen.y <= y1 + pad && screen.x >= x0 - pad && screen.x <= x1 + pad) {
        ySide = "s";
    }
    if (!xSide && !ySide) {
        return null;
    }
    return `${ySide}${xSide}` as ResizeHandle;
}

/** Returns the id of the sprite containing an image-space point, or null. */
export function hitTestSprite(imagePos: Point, sprites: SpriteRegion[]): string | null {
    for (let i = sprites.length - 1; i >= 0; i--) {
        const sprite = sprites[i];
        if (
            imagePos.x >= sprite.x
            && imagePos.x < sprite.x + sprite.width
            && imagePos.y >= sprite.y
            && imagePos.y < sprite.y + sprite.height
        ) {
            return sprite.id;
        }
    }
    return null;
}
