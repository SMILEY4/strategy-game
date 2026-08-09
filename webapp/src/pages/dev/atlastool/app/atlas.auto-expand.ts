import type {AtlasLayer, Rect} from "@pages/dev/atlastool/app/atlas.types.ts";

export interface ExpandOptions {
    /** Alpha channel threshold (0-255). Values <= threshold count as transparent. Default: 0 */
    alphaThreshold?: number;
    /** Extra padding pixels to add to the final bounding box. Default: 0 */
    padding?: number;
}

/** Returns the cached alpha channel for the layer, computing and storing it on the layer on first use. */
function getLayerAlpha(layer: AtlasLayer): Uint8Array | null {
    const width = layer.element.naturalWidth || layer.element.width;
    const height = layer.element.naturalHeight || layer.element.height;

    if (layer.alpha) {
        if (layer.alpha.length === width * height) {
            return layer.alpha;
        }
        layer.alpha = null;
    }

    if (width <= 0 || height <= 0) return null;

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;

    ctx.drawImage(layer.element, 0, 0);
    const rgba = ctx.getImageData(0, 0, width, height).data;
    const alpha = new Uint8Array(width * height);
    for (let i = 0, a = 3; i < alpha.length; i++, a += 4) {
        alpha[i] = rgba[a];
    }
    layer.alpha = alpha;
    return alpha;
}

/**
 * Expands an initial selection rectangle outward to fit the surrounding sprite.
 */
export function autoExpandSpriteBounds(layer: AtlasLayer, initialRect: Rect, options: ExpandOptions = {}): Rect | null {
    const { alphaThreshold = 0, padding = 0 } = options;

    const data = getLayerAlpha(layer);
    if (!data) return null;

    const imageWidth = layer.element.naturalWidth || layer.element.width;
    const imageHeight = layer.element.naturalHeight || layer.element.height;

    // 1. Sanitize & clamp initial input rectangle
    let minX = Math.max(0, Math.floor(initialRect.x));
    let minY = Math.max(0, Math.floor(initialRect.y));
    let maxX = Math.min(imageWidth - 1, Math.floor(initialRect.x + initialRect.width - 1));
    let maxY = Math.min(imageHeight - 1, Math.floor(initialRect.y + initialRect.height - 1));

    if (minX > maxX || minY > maxY) return null;

    // Check if a pixel at (x, y) is solid (non-transparent)
    const isOpaque = (x: number, y: number): boolean => {
        return data[y * imageWidth + x] > alphaThreshold;
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
