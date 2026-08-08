import type {AtlasEditor} from "@pages/dev/atlastool/app/atlas.editor.ts";
import {type PointerEvent as ReactPointerEvent, type RefObject, useRef, useState} from "react";
import type {AtlasTool, Point, Rect, ResizeHandle, Size, SpriteRegion, Viewport} from "@pages/dev/atlastool/app/atlas.types.ts";
import {
    clamp,
    clampMove,
    clampResize,
    rectFromPoints,
    snapPoint,
    ZOOM_LEVEL_STEP,
    zoomAt,
    zoomFromLevel, zoomToLevel,
} from "@pages/dev/atlastool/app/atlas.geometry.ts";

type Interaction =
    | { type: "pan", startScreen: Point, startPan: { x: number, y: number } }
    | { type: "draw", start: Point }
    | { type: "move", spriteId: string, startRegion: Rect, startImage: Point }
    | { type: "resize", spriteId: string, handle: ResizeHandle, startRegion: Rect };


export function useAtlasCanvas(editor: AtlasEditor<true>, externalCanvasRef?: RefObject<HTMLCanvasElement | null>) {

    const internalCanvasRef = useRef<HTMLCanvasElement>(null);
    const canvasRef = externalCanvasRef ?? internalCanvasRef;
    const interactionRef = useRef<Interaction | null>(null);

    // the currently hovered sprite
    const [hoverSpriteId, setHoverSpriteId] = useState<string | null>(null);

    // the current draft sprite in the progress of being drawn.
    const [draft, setDraft] = useState<Rect | null>(null);


    //=========== EVENT HANDLERS =========================================================

    function handlePointerDown(event: ReactPointerEvent<HTMLCanvasElement>) {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.setPointerCapture(event.pointerId);
        const pointScreen = toScreen(event, canvas);
        const pointImage = toImage(event, canvas, editor.project.viewport.value);

        if (event.button === 1) { // middle mouse button
            startToolPan(event, pointScreen, pointImage);
            return;
        }

        if(event.button === 2) { // right mouse button
            return;
        }

        if (editor.project.tool.active === "select") {
            startToolSelect(event, pointScreen, pointImage);
            return;
        }
        if (editor.project.tool.active === "draw") {
            startToolDraw(event, pointScreen, pointImage);
            return;
        }
        if (editor.project.tool.active === "pan") {
            startToolPan(event, pointScreen, pointImage);
            return;
        }
    }

    function handlePointerMove(event: ReactPointerEvent<HTMLCanvasElement>) {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.setPointerCapture(event.pointerId);
        const pointScreen = toScreen(event, canvas);
        const pointImage = toImage(event, canvas, editor.project.viewport.value);

        const interaction = interactionRef.current;

        if (interaction == null) {
            if (editor.project.tool.active === "select") {
                startInteractionHoverSprite(pointScreen, pointImage);
            } else {
                endInteractionHoverSprite();
            }
            return;
        }

        if (interaction.type === "pan") {
            continueInteractionPan(pointScreen, interaction);
            return;
        }

        if (interaction.type === "draw") {
            continueInteractionDraw(pointImage, interaction);
            return;
        }

        if (interaction.type === "move") {
            continueInteractionMove(pointImage, interaction);
            return;
        }

        if (interaction.type === "resize") {
            continueInteractionResize(pointImage, interaction);
            return;
        }

    }


    function handlePointerUp(event: ReactPointerEvent<HTMLCanvasElement>) {
        const canvas = canvasRef.current;
        if (!canvas) return;

        if (canvas.hasPointerCapture(event.pointerId)) {
            canvas.releasePointerCapture(event.pointerId);
        }

        const interaction = interactionRef.current;
        interactionRef.current = null;
        setCanvasCursor(defaultCursor(editor.project.tool.active));

        if (interaction?.type === "draw") {
            endInteractionDraw(interaction);
            return;
        }
    }


    function handlePointerCancel(_event: ReactPointerEvent<HTMLCanvasElement>) {
        interactionRef.current = null;
        setDraft(null);
        setCanvasCursor(defaultCursor(editor.project.tool.active));
    }


    function handlePointerLeave(_event: ReactPointerEvent<HTMLCanvasElement>) {
        if (!interactionRef.current) {
            setHoverSpriteId(null);
            setCanvasCursor(defaultCursor(editor.project.tool.active));
        }
    }


    function handleMouseDown(event: any) {
        if (event.button === 1) {
            event.preventDefault();
        }
    }


    function handleAuxClick(event: any) {
        if (event.button === 1) {
            event.preventDefault();
        }
    }

    function handleWheel(event: WheelEvent) {
        const canvas = canvasRef.current;
        if (!canvas) return;

        event.preventDefault();
        const viewport = editor.project.viewport.value;
        const rect = canvas!.getBoundingClientRect();
        const screen = {x: event.clientX - rect.left, y: event.clientY - rect.top};
        const levelStep = event.deltaY < 0 ? ZOOM_LEVEL_STEP : -ZOOM_LEVEL_STEP;
        const nextZoom = zoomFromLevel(zoomToLevel(viewport.zoom) + levelStep);
        editor.project.viewport.set(zoomAt(viewport, screen, nextZoom));
    }

    //=========== TOOL SELECT ============================================================

    function startToolSelect(_event: ReactPointerEvent<HTMLCanvasElement>, pointScreen: Point, pointImage: Point) {
        const selectedSprite = editor.project.sprites.selected;
        if (selectedSprite) {
            const edgeHandle = hitTestEdge(pointScreen, selectedSprite, editor.project.viewport.value);
            if (edgeHandle) {
                interactionRef.current = {
                    type: "resize",
                    spriteId: selectedSprite.id,
                    handle: edgeHandle,
                    startRegion: {...selectedSprite},
                };
                setCanvasCursor(RESIZE_CURSORS[edgeHandle]);
                return;
            }
        }
        const hitSpriteId = hitTestSprite(pointImage, editor.project.sprites.list);
        if (hitSpriteId) {
            const sprite = editor.project.sprites.list.find(it => it.id === hitSpriteId)!;
            interactionRef.current = {type: "move", spriteId: hitSpriteId, startRegion: {...sprite}, startImage: pointImage};
            editor.project.sprites.select(hitSpriteId);
            setCanvasCursor("move");
        } else {
            editor.project.sprites.select(null);
            startInteractionPan(pointScreen);
        }
    }

    //=========== TOOL DRAW ==============================================================

    function startToolDraw(_event: ReactPointerEvent<HTMLCanvasElement>, _pointScreen: Point, pointImage: Point) {
        const start = clampPointToImage(snapPoint(pointImage), editor.project.image.size);
        interactionRef.current = {type: "draw", start};
        setDraft(rectFromPoints(start, start));
        setCanvasCursor("crosshair");
    }

    //=========== TOOL PAN ===============================================================

    function startToolPan(_event: ReactPointerEvent<HTMLCanvasElement>, pointScreen: Point, _pointImage: Point) {
        startInteractionPan(pointScreen);
    }


    //=========== INTERACTION HOVER SPRITE ===============================================

    function startInteractionHoverSprite(pointScreen: Point, pointImage: Point) {
        const hit = hitTestSprite(pointImage, editor.project.sprites.list);
        setHoverSpriteId(prev => prev === hit ? prev : hit);
        setCanvasCursor(selectCursor(pointScreen, pointImage, editor.project.sprites.list, editor.project.sprites.selectedId, editor.project.viewport.value));
    }

    function endInteractionHoverSprite() {
        setHoverSpriteId(null);
        setCanvasCursor(defaultCursor(editor.project.tool.active));
    }

    //=========== INTERACTION PAN ========================================================

    function startInteractionPan(pointScreen: Point) {
        interactionRef.current = {
            type: "pan",
            startScreen: pointScreen,
            startPan: {x: editor.project.viewport.value.x, y: editor.project.viewport.value.y},
        };
        setCanvasCursor("grabbing");
    }

    function continueInteractionPan(pointScreen: Point, interaction: {
        type: "pan",
        startScreen: Point,
        startPan: { x: number, y: number }
    }) {
        editor.project.viewport.set({
            x: interaction.startPan.x + (pointScreen.x - interaction.startScreen.x),
            y: interaction.startPan.y + (pointScreen.y - interaction.startScreen.y),
        });
    }

    //=========== INTERACTION DRAW =======================================================

    function continueInteractionDraw(pointImage: Point, interaction: { type: "draw", start: Point }) {
        const current = clampPointToImage(snapPoint(pointImage), editor.project.image.size);
        setDraft(rectFromPoints(interaction.start, current));
    }

    function endInteractionDraw(_interaction: { type: "draw"; start: Point }) {
        if (draft) {
            editor.project.sprites.create(draft);
            setDraft(null);
        }
    }

    //=========== INTERACTION MOVE =======================================================

    function continueInteractionMove(pointImage: Point, interaction: {
        type: "move",
        spriteId: string,
        startRegion: Rect,
        startImage: Point
    }) {
        const dx = pointImage.x - interaction.startImage.x;
        const dy = pointImage.y - interaction.startImage.y;
        editor.project.sprites.updateRegion(
            interaction.spriteId,
            clampMove(interaction.startRegion, dx, dy, editor.project.image.size),
        );
    }

    //=========== INTERACTION RESIZE =====================================================

    function continueInteractionResize(pointImage: Point, interaction: {
        type: "resize",
        spriteId: string,
        handle: ResizeHandle,
        startRegion: Rect
    }) {
        editor.project.sprites.updateRegion(
            interaction.spriteId,
            clampResize(interaction.startRegion, interaction.handle, pointImage, editor.project.image.size),
        );
    }

    //=========== RENDER =================================================================

    function render() {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const viewport = editor.project.viewport.value;
        const image = editor.project.image.element
        const imageSize = editor.project.image.size

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
            if (selected) {
                drawHandles(ctx, sprite, viewport);
            }
        }

        if (draft) {
            drawRect(ctx, draft, viewport, COLORS.draft, 2);
        }

        if (hoverSpriteId && hoverSpriteId !== editor.project.sprites.selectedId) {
            const hovered = editor.project.sprites.list.find(sprite => sprite.id === hoverSpriteId);
            if (hovered) {
                drawRect(ctx, hovered, viewport, COLORS.hover, 1);
            }
        }

    }

    //=========== MISCELLANEOUS ==========================================================

    function setCanvasCursor(cursor: string) {
        const canvas = canvasRef.current;
        if (canvas) {
            canvas.style.cursor = cursor;
        }
    }

    return {
        hoverSpriteId: hoverSpriteId,
        canvasRef: canvasRef,
        onPointerDown: handlePointerDown,
        onPointerMove: handlePointerMove,
        onPointerUp: handlePointerUp,
        onPointerCancel: handlePointerCancel,
        onPointerLeave: handlePointerLeave,
        onMouseDown: handleMouseDown,
        onAuxClick: handleAuxClick,
        onWheel: handleWheel,
        render: render
    };
}

function toScreen(event: { clientX: number, clientY: number }, canvas: HTMLCanvasElement): Point {
    const rect = canvas.getBoundingClientRect();
    return {x: event.clientX - rect.left, y: event.clientY - rect.top};
}

function toImage(event: { clientX: number, clientY: number }, canvas: HTMLCanvasElement, viewport: Viewport): Point {
    return toImagePoint(toScreen(event, canvas), viewport);
}

/** Converts a canvas/screen point back to image space. */
function toImagePoint(p: Point, viewport: Viewport): Point {
    return {x: (p.x - viewport.x) / viewport.zoom, y: (p.y - viewport.y) / viewport.zoom};
}

/** Converts an image-space rect to a screen rect (position scaled and offset by the viewport). */
function toScreenRect(region: Rect, viewport: Viewport): Rect {
    const origin = toScreenPoint(region, viewport);
    return {x: origin.x, y: origin.y, width: region.width * viewport.zoom, height: region.height * viewport.zoom};
}

/** Converts an image-space point to canvas/screen coordinates. */
function toScreenPoint(p: Point, viewport: Viewport): Point {
    return {x: viewport.x + p.x * viewport.zoom, y: viewport.y + p.y * viewport.zoom};
}


/** Clamps a point so it stays inside the image bounds. */
function clampPointToImage(p: Point, size: Size): Point {
    return {
        x: clamp(p.x, 0, Math.max(0, size.width - 1)),
        y: clamp(p.y, 0, Math.max(0, size.height - 1)),
    };
}

/** Returns which resize edge/corner of a region a screen point is over, or null. */
function hitTestEdge(screen: Point, region: Rect, viewport: Viewport): ResizeHandle | null {
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
    return `${xSide}${ySide}` as ResizeHandle;
}

/** Returns the id of the sprite containing an image-space point, or null. */
function hitTestSprite(imagePos: Point, sprites: SpriteRegion[]): string | null {
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

const RESIZE_CURSORS: Record<ResizeHandle, string> = {
    n: "ns-resize",
    s: "ns-resize",
    e: "ew-resize",
    w: "ew-resize",
    nw: "nwse-resize",
    se: "nwse-resize",
    ne: "nesw-resize",
    sw: "nesw-resize",
};

function selectCursor(pointScreen: Point, pointImage: Point, sprites: SpriteRegion[], selectedSpriteId: string | null, viewport: Viewport): string {
    const hit = hitTestSprite(pointImage, sprites);
    if (selectedSpriteId) {
        const selected = sprites.find(sprite => sprite.id === selectedSpriteId);
        if (selected) {
            const handle = hitTestEdge(pointScreen, selected, viewport);
            if (handle) {
                return RESIZE_CURSORS[handle];
            }
        }
    }
    return hit ? "move" : "crosshair";
}


function defaultCursor(tool: AtlasTool): string {
    return tool === "pan" ? "grab" : "crosshair";
}

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
    handleFill: "#ffffff",
    draft: "rgba(0,200,255,0.95)",
    hover: "rgba(255,255,255,0.7)",
};

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

/** Draws a sprite border; fills it when selected. */
function drawSprite(ctx: CanvasRenderingContext2D, sprite: SpriteRegion, viewport: Viewport, selected: boolean) {
    if (selected) {
        const rect = toScreenRect(sprite, viewport);
        ctx.fillStyle = COLORS.spriteFillSelected;
        ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
    }
    drawRect(ctx, sprite, viewport, selected ? COLORS.spriteSelected : COLORS.sprite, selected ? 2 : 1);
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
