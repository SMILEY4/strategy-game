import type {AtlasLayer, Rect} from "@pages/dev/atlastool/app/atlas.types.ts";

export interface ExpandOptions {
    /** Alpha channel threshold (0-255). Values <= threshold count as transparent. Default: 0 */
    alphaThreshold?: number;
    /** Extra padding pixels to add to the final bounding box. Default: 0 */
    padding?: number;
}

let sharedCanvas: HTMLCanvasElement | null = null;
let sharedContext: CanvasRenderingContext2D | null = null;
let drawnElement: HTMLImageElement | null = null;

/** Returns a shared canvas with the layer's image drawn into it, re-drawing only when the source changes. */
function getLayerContext(layer: AtlasLayer): CanvasRenderingContext2D | null {
    const width = layer.size.width;
    const height = layer.size.height;

    if (width <= 0 || height <= 0) return null;

    if (!sharedCanvas) {
        sharedCanvas = document.createElement("canvas");
    }
    if (sharedCanvas.width !== width || sharedCanvas.height !== height) {
        sharedCanvas.width = width;
        sharedCanvas.height = height;
        sharedContext = null;
        drawnElement = null;
    }
    if (!sharedContext) {
        sharedContext = sharedCanvas.getContext("2d", { willReadFrequently: true });
        if (!sharedContext) return null;
    }
    if (drawnElement !== layer.element) {
        sharedContext.drawImage(layer.element, 0, 0);
        drawnElement = layer.element;
    }
    return sharedContext;
}

/**
 * Expands an initial selection rectangle outward to fit the surrounding sprite.
 *
 * Reads only the pixels needed for the expansion: the read region starts at the initial
 * rectangle and grows outward in steps as the bounds expand, instead of reading the
 * whole image up front.
 */
export function autoExpandSpriteBounds(layer: AtlasLayer, initialRect: Rect, options: ExpandOptions = {}): Rect | null {
    const { alphaThreshold = 0, padding = 0 } = options;

    const ctx = getLayerContext(layer);
    if (!ctx) return null;

    const imageWidth = layer.size.width;
    const imageHeight = layer.size.height;

    // 1. Sanitize & clamp initial input rectangle
    let minX = Math.max(0, Math.floor(initialRect.x));
    let minY = Math.max(0, Math.floor(initialRect.y));
    let maxX = Math.min(imageWidth - 1, Math.floor(initialRect.x + initialRect.width - 1));
    let maxY = Math.min(imageHeight - 1, Math.floor(initialRect.y + initialRect.height - 1));

    if (minX > maxX || minY > maxY) return null;

    // Read region covering the current bounds; grows (in chunks) as the bounds expand.
    let readX = minX;
    let readY = minY;
    let readW = maxX - minX + 1;
    let readH = maxY - minY + 1;
    let data = ctx.getImageData(readX, readY, readW, readH).data;

    const readPixel = (x: number, y: number): number => {
        if (x < readX || x > readX + readW - 1 || y < readY || y > readY + readH - 1) {
            const x0 = Math.max(0, minX - 1 - readW);
            const y0 = Math.max(0, minY - 1 - readH);
            const x1 = Math.min(imageWidth - 1, maxX + 1 + readW);
            const y1 = Math.min(imageHeight - 1, maxY + 1 + readH);
            readX = x0;
            readY = y0;
            readW = x1 - x0 + 1;
            readH = y1 - y0 + 1;
            data = ctx.getImageData(readX, readY, readW, readH).data;
        }
        return data[((y - readY) * readW + (x - readX)) * 4 + 3];
    };

    const isOpaque = (x: number, y: number): boolean => {
        return readPixel(x, y) > alphaThreshold;
    };

    // Check if the initial box contains any visible pixels at all
    let hasContent = false;
    for (let y = minY; y <= maxY && !hasContent; y++) {
        for (let x = minX; x <= maxX; x++) {
            if (isOpaque(x, y)) {
                hasContent = true;
                break;
            }
        }
    }

    if (!hasContent) return null;

    // 3. Iterative Edge Expansion
    // We expand edges independently in 4 directions as long as we find opaque pixels along them
    let expanded = true;

    while (expanded) {
        expanded = false;

        // Expand TOP
        if (minY > 0) {
            let foundOpaque = false;
            for (let x = minX; x <= maxX; x++) {
                if (isOpaque(x, minY - 1)) {
                    foundOpaque = true;
                    break;
                }
            }
            if (foundOpaque) {
                minY--;
                expanded = true;
            }
        }

        // Expand BOTTOM
        if (maxY < imageHeight - 1) {
            let foundOpaque = false;
            for (let x = minX; x <= maxX; x++) {
                if (isOpaque(x, maxY + 1)) {
                    foundOpaque = true;
                    break;
                }
            }
            if (foundOpaque) {
                maxY++;
                expanded = true;
            }
        }

        // Expand LEFT
        if (minX > 0) {
            let foundOpaque = false;
            for (let y = minY; y <= maxY; y++) {
                if (isOpaque(minX - 1, y)) {
                    foundOpaque = true;
                    break;
                }
            }
            if (foundOpaque) {
                minX--;
                expanded = true;
            }
        }

        // Expand RIGHT
        if (maxX < imageWidth - 1) {
            let foundOpaque = false;
            for (let y = minY; y <= maxY; y++) {
                if (isOpaque(maxX + 1, y)) {
                    foundOpaque = true;
                    break;
                }
            }
            if (foundOpaque) {
                maxX++;
                expanded = true;
            }
        }
    }

    // 4. Apply optional padding and return result
    const finalX = Math.max(0, minX - padding);
    const finalY = Math.max(0, minY - padding);
    const finalMaxX = Math.min(imageWidth - 1, maxX + padding);
    const finalMaxY = Math.min(imageHeight - 1, maxY + padding);

    return {
        x: finalX,
        y: finalY,
        width: finalMaxX - finalX + 1,
        height: finalMaxY - finalY + 1,
    };
}
