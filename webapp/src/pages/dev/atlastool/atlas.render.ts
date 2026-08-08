import type {Point, Rect, Size, SpriteRegion, Viewport} from "./atlas.types.ts";
import {toScreenRect} from "./atlas.geometry.ts";

export const HANDLE_SIZE = 8;
export const MIN_GRID_ZOOM = 3;

export const COLORS = {
    background: "#1e2024",
    placeholder: "#7a8290",
    imageBorder: "rgba(255,255,255,0.6)",
    grid: "rgba(255,255,255,0.08)",
    sprite: "rgba(255,90,90,0.9)",
    spriteSelected: "#2ea6ff",
    spriteFillSelected: "rgba(0,150,255,0.2)",
    handleFill: "#ffffff",
    draft: "rgba(0,200,255,0.95)",
    hover: "rgba(255,255,255,0.7)",
};

/** Canvas drawing helpers. All coordinates are converted from image space to screen space via the viewport. */

export function drawRect(ctx: CanvasRenderingContext2D, region: Rect, viewport: Viewport, color: string, lineWidth: number) {
    const rect = toScreenRect(region, viewport);
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
}

/** Draws the loaded image, scaled to the viewport, with a border around it. */
export function drawImage(ctx: CanvasRenderingContext2D, image: HTMLImageElement, viewport: Viewport, imageSize: Size) {
    const rect = toScreenRect({x: 0, y: 0, ...imageSize}, viewport);
    ctx.imageSmoothingEnabled = !(Number.isInteger(viewport.zoom) && viewport.zoom >= 1);
    ctx.drawImage(image, rect.x, rect.y, rect.width, rect.height);
    ctx.imageSmoothingEnabled = true;
    ctx.strokeStyle = COLORS.imageBorder;
    ctx.lineWidth = 1;
    ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
}

/** Draws pixel grid lines, but only at high enough zoom to be useful. */
export function drawGrid(ctx: CanvasRenderingContext2D, viewport: Viewport, imageSize: Size, cssWidth: number, cssHeight: number) {
    if (viewport.zoom < MIN_GRID_ZOOM) {
        return;
    }
    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 1;
    const firstCol = Math.max(1, Math.ceil((0 - viewport.x) / viewport.zoom));
    for (let col = firstCol; col < imageSize.width; col++) {
        const x = Math.round(viewport.x + col * viewport.zoom) + 0.5;
        if (x > cssWidth) {
            break;
        }
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, cssHeight);
        ctx.stroke();
    }
    const firstRow = Math.max(1, Math.ceil((0 - viewport.y) / viewport.zoom));
    for (let row = firstRow; row < imageSize.height; row++) {
        const y = Math.round(viewport.y + row * viewport.zoom) + 0.5;
        if (y > cssHeight) {
            break;
        }
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(cssWidth, y);
        ctx.stroke();
    }
}

/** Draws a sprite border; fills it when selected. */
export function drawSprite(ctx: CanvasRenderingContext2D, sprite: SpriteRegion, viewport: Viewport, selected: boolean) {
    if (selected) {
        const rect = toScreenRect(sprite, viewport);
        ctx.fillStyle = COLORS.spriteFillSelected;
        ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
    }
    drawRect(ctx, sprite, viewport, selected ? COLORS.spriteSelected : COLORS.sprite, selected ? 2 : 1);
}

/** Draws the resize handles at the corners of a region. */
export function drawHandles(ctx: CanvasRenderingContext2D, region: Rect, viewport: Viewport) {
    const rect = toScreenRect(region, viewport);
    const corners: Point[] = [
        {x: rect.x, y: rect.y},
        {x: rect.x + rect.width, y: rect.y},
        {x: rect.x + rect.width, y: rect.y + rect.height},
        {x: rect.x, y: rect.y + rect.height},
    ];
    for (const corner of corners) {
        ctx.fillStyle = COLORS.handleFill;
        ctx.fillRect(corner.x - HANDLE_SIZE / 2, corner.y - HANDLE_SIZE / 2, HANDLE_SIZE, HANDLE_SIZE);
        ctx.strokeStyle = COLORS.spriteSelected;
        ctx.lineWidth = 1;
        ctx.strokeRect(corner.x - HANDLE_SIZE / 2, corner.y - HANDLE_SIZE / 2, HANDLE_SIZE, HANDLE_SIZE);
    }
}
