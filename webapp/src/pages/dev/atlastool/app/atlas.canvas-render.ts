import type {AtlasEditor} from "@pages/dev/atlastool/app/atlas.editor.ts";
import type {Point, Rect, Size, SpriteRegion, Viewport} from "@pages/dev/atlastool/app/atlas.types.ts";
import {toScreenRect} from "@pages/dev/atlastool/app/atlas.geometry.ts";

const HANDLE_SIZE = 8;
const MIN_GRID_ZOOM = 3;

const COLORS = {
    background: "#1e2024",
    placeholder: "#7a8290",
    imageBorder: "rgba(255,255,255,0.6)",
    grid: "rgba(255,255,255,0.08)",
    sprite: "rgba(255,90,90,0.9)",
    spriteSelected: "#2ea6ff",
    spriteFillSelected: "rgba(0,150,255,0.2)",
    spriteLocked: "rgba(160,170,190,0.9)",
    spriteFillLocked: "rgba(120,130,150,0.15)",
    handleFill: "#ffffff",
    spriteName: "rgba(255,255,255,0.5)",
    draft: "rgba(0,200,255,0.95)",
    hover: "rgba(255,255,255,0.7)",
};

export function renderCanvas(editor: AtlasEditor<true>, canvas: HTMLCanvasElement, hoverSpriteId: string | null, draft: Rect | null) {

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const viewport = editor.project.viewport.value;
    const image = editor.project.images.active?.element ?? null;
    const imageSize = editor.project.images.size;

    const dpr = window.devicePixelRatio || 1;
    const cssWidth = canvas.clientWidth;
    const cssHeight = canvas.clientHeight;
    const deviceWidth = Math.round(cssWidth * dpr);
    const deviceHeight = Math.round(cssHeight * dpr);

    if (canvas.width !== deviceWidth || canvas.height !== deviceHeight) {
        canvas.width = deviceWidth;
        canvas.height = deviceHeight;
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, cssWidth, cssHeight);

    if (!image || imageSize.width <= 0 || imageSize.height <= 0) {
        ctx.fillStyle = COLORS.placeholder;
        ctx.font = "14px sans-serif";
        ctx.fillText("No image loaded", 16, 28);
        return;
    }

    drawImage(ctx, image, viewport, imageSize);

    drawGrid(ctx, viewport, imageSize, cssWidth, cssHeight);

    for (const sprite of editor.project.sprites.list) {
        const selected = sprite.id === editor.project.sprites.selectedId;
        drawSprite(ctx, sprite, viewport, selected);
        drawSpriteName(ctx, sprite, viewport);
        if (selected && !sprite.locked) {
            drawHandles(ctx, sprite, viewport);
        }
    }

    if (draft) {
        drawRect(ctx, draft, viewport, COLORS.draft, 2);
    }

    if (hoverSpriteId && hoverSpriteId !== editor.project.sprites.selectedId) {
        const hovered = editor.project.sprites.list.find(sprite => sprite.id === hoverSpriteId);
        if (hovered) {
            drawRect(ctx, hovered, viewport, hovered.locked ? COLORS.spriteLocked : COLORS.hover, 1);
        }
    }
}


/** Canvas drawing helpers. All coordinates are converted from image space to screen space via the viewport. */

function drawRect(ctx: CanvasRenderingContext2D, region: Rect, viewport: Viewport, color: string, lineWidth: number) {
    const rect = toScreenRect(region, viewport);
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
}

/** Draws the loaded image, scaled to the viewport, with a border around it. */
function drawImage(ctx: CanvasRenderingContext2D, image: HTMLImageElement, viewport: Viewport, imageSize: Size) {
    const rect = toScreenRect({x: 0, y: 0, ...imageSize}, viewport);
    ctx.imageSmoothingEnabled = viewport.zoom <= MIN_GRID_ZOOM;
    ctx.drawImage(image, rect.x, rect.y, rect.width, rect.height);
    ctx.imageSmoothingEnabled = true;
    ctx.strokeStyle = COLORS.imageBorder;
    ctx.lineWidth = 1;
    ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
}

/** Draws pixel grid lines, but only at high enough zoom to be useful. */
function drawGrid(ctx: CanvasRenderingContext2D, viewport: Viewport, imageSize: Size, cssWidth: number, cssHeight: number) {
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

/** Draws a sprite border; fills it when selected. Locked sprites are dashed and muted. */
function drawSprite(ctx: CanvasRenderingContext2D, sprite: SpriteRegion, viewport: Viewport, selected: boolean) {
    if (selected) {
        const rect = toScreenRect(sprite, viewport);
        ctx.fillStyle = sprite.locked ? COLORS.spriteFillLocked : COLORS.spriteFillSelected;
        ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
    }
    const color = sprite.locked ? COLORS.spriteLocked : selected ? COLORS.spriteSelected : COLORS.sprite;
    const lineWidth = selected ? 2 : 1;
    if (sprite.locked) {
        ctx.setLineDash([4, 4]);
        drawRect(ctx, sprite, viewport, color, lineWidth);
        ctx.setLineDash([]);
    } else {
        drawRect(ctx, sprite, viewport, color, lineWidth);
    }
}

/** Draws the sprite name as subtle text at the top-left of its region, when large enough to read. */
function drawSpriteName(ctx: CanvasRenderingContext2D, sprite: SpriteRegion, viewport: Viewport) {
    const rect = toScreenRect(sprite, viewport);
    if (!sprite.name || rect.width < 24 || rect.height < 16) {
        return;
    }
    const fontSize = Math.min(11, Math.max(8, rect.height * 0.4));
    ctx.font = `${fontSize}px sans-serif`;
    ctx.textBaseline = "alphabetic";
    const maxWidth = Math.max(rect.width - 6, 0);
    let text = sprite.name;
    if (ctx.measureText(text).width > maxWidth) {
        while (text.length > 1 && ctx.measureText(text + "…").width > maxWidth) {
            text = text.slice(0, -1);
        }
        text += "…";
    }
    ctx.fillStyle = COLORS.spriteName;
    ctx.fillText(text, rect.x + 3, rect.y + fontSize);
}

/** Draws the resize handles at the corners of a region. */
function drawHandles(ctx: CanvasRenderingContext2D, region: Rect, viewport: Viewport) {
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
