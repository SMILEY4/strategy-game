import {useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactElement} from "react";
import type {AtlasTool, Point, Rect, ResizeHandle, Size, SpriteRegion, Viewport} from "./atlas.types.ts";
import {
    clampMove,
    clampPointToImage,
    clampResize,
    rectFromPoints,
    snapPoint,
    toImagePoint,
    toScreenRect,
    ZOOM_LEVEL_STEP,
    zoomFromLevel,
    zoomToLevel,
} from "./atlas.geometry.ts";
import {COLORS, drawGrid, drawHandles, drawImage, drawRect, drawSprite} from "./atlas.render.ts";

const EDGE_THRESHOLD = 6;

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

interface AtlasCanvasProps {
    image: HTMLImageElement | null;
    imageSize: Size;
    sprites: SpriteRegion[];
    selectedSpriteId: string | null;
    tool: AtlasTool;
    viewport: Viewport;
    onSelectSprite: (id: string | null) => void;
    onCreateSprite: (region: Rect) => void;
    onUpdateSprite: (id: string, region: Rect) => void;
    onSetViewport: (viewport: Viewport) => void;
}

type Interaction =
    | { type: "pan", startScreen: Point, startPan: { x: number, y: number } }
    | { type: "draw", start: Point }
    | { type: "move", spriteId: string, startRegion: Rect, startImage: Point }
    | { type: "resize", spriteId: string, handle: ResizeHandle, startRegion: Rect };

/** Returns which resize edge/corner of a region a screen point is over, or null. */
function hitTestEdge(screen: Point, region: Rect, viewport: Viewport): ResizeHandle | null {
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

/** Interactive canvas: pans/zooms the viewport and draws/selects/moves/resizes sprites with the pointer. */
export function AtlasCanvas(props: AtlasCanvasProps): ReactElement {

    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const statusRef = useRef<HTMLSpanElement>(null);
    const propsRef = useRef<AtlasCanvasProps>(props);
    propsRef.current = props;

    const interactionRef = useRef<Interaction | null>(null);
    const [draft, setDraft] = useState<Rect | null>(null);
    const [hoverSpriteId, setHoverSpriteId] = useState<string | null>(null);
    const [, setSizeTick] = useState(0);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) {
            return;
        }
        const observer = new ResizeObserver(() => setSizeTick(value => value + 1));
        observer.observe(container);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) {
            return;
        }
        function onWheel(event: WheelEvent) {
            event.preventDefault();
            const {viewport, onSetViewport} = propsRef.current;
            const rect = canvas.getBoundingClientRect();
            const screen = {x: event.clientX - rect.left, y: event.clientY - rect.top};
            const levelStep = event.deltaY < 0 ? ZOOM_LEVEL_STEP : -ZOOM_LEVEL_STEP;
            const nextZoom = zoomFromLevel(zoomToLevel(viewport.zoom) + levelStep);
            const scale = nextZoom / viewport.zoom;
            onSetViewport({
                zoom: nextZoom,
                x: screen.x - (screen.x - viewport.x) * scale,
                y: screen.y - (screen.y - viewport.y) * scale,
            });
        }
        canvas.addEventListener("wheel", onWheel, {passive: false});
        return () => canvas.removeEventListener("wheel", onWheel);
    }, []);

    useEffect(() => {
        draw();
    });

    function draw() {
        const canvas = canvasRef.current;
        if (!canvas) {
            return;
        }
        const ctx = canvas.getContext("2d");
        if (!ctx) {
            return;
        }
        const {image, imageSize, sprites, selectedSpriteId, viewport} = propsRef.current;
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

        for (const sprite of sprites) {
            const selected = sprite.id === selectedSpriteId;
            drawSprite(ctx, sprite, viewport, selected);
            if (selected) {
                drawHandles(ctx, sprite, viewport);
            }
        }

        if (draft) {
            drawRect(ctx, draft, viewport, COLORS.draft, 2);
        }

        if (hoverSpriteId && hoverSpriteId !== selectedSpriteId) {
            const hovered = sprites.find(sprite => sprite.id === hoverSpriteId);
            if (hovered) {
                drawRect(ctx, hovered, viewport, COLORS.hover, 1);
            }
        }
    }

    function toScreen(event: { clientX: number, clientY: number }): Point {
        const rect = canvasRef.current!.getBoundingClientRect();
        return {x: event.clientX - rect.left, y: event.clientY - rect.top};
    }

    function toImage(event: { clientX: number, clientY: number }): Point {
        return toImagePoint(toScreen(event), propsRef.current.viewport);
    }

    function defaultCursor(tool: AtlasTool): string {
        return tool === "pan" ? "grab" : "crosshair";
    }

    function setCanvasCursor(cursor: string) {
        const canvas = canvasRef.current;
        if (canvas) {
            canvas.style.cursor = cursor;
        }
    }

    function selectCursor(screen: Point, imagePos: Point): string {
        const {sprites, selectedSpriteId, viewport} = propsRef.current;
        const hit = hitTestSprite(imagePos, sprites);
        if (selectedSpriteId) {
            const selected = sprites.find(sprite => sprite.id === selectedSpriteId);
            if (selected) {
                const handle = hitTestEdge(screen, selected, viewport);
                if (handle) {
                    return RESIZE_CURSORS[handle];
                }
            }
        }
        return hit ? "move" : "crosshair";
    }

    function beginPan(screen: Point) {
        const {viewport} = propsRef.current;
        interactionRef.current = {type: "pan", startScreen: screen, startPan: {x: viewport.x, y: viewport.y}};
        setCanvasCursor("grabbing");
    }

    function handlePointerDown(event: ReactPointerEvent<HTMLCanvasElement>) {
        const canvas = canvasRef.current;
        if (!canvas) {
            return;
        }
        canvas.setPointerCapture(event.pointerId);
        const screen = toScreen(event);
        const imagePos = toImage(event);
        const {tool, viewport, sprites, selectedSpriteId, imageSize} = propsRef.current;

        if (event.button === 1 || tool === "pan") {
            if (event.button === 1) {
                event.preventDefault();
            }
            beginPan(screen);
            return;
        }

        if (tool === "draw") {
            const start = clampPointToImage(snapPoint(imagePos), imageSize);
            interactionRef.current = {type: "draw", start};
            setDraft(rectFromPoints(start, start));
            setCanvasCursor("crosshair");
            return;
        }

        if (tool === "select") {
            const selected = selectedSpriteId ? sprites.find(sprite => sprite.id === selectedSpriteId) : undefined;
            if (selected) {
                const handle = hitTestEdge(screen, selected, viewport);
                if (handle) {
                    interactionRef.current = {type: "resize", spriteId: selected.id, handle, startRegion: {...selected}};
                    setCanvasCursor(RESIZE_CURSORS[handle]);
                    return;
                }
            }
            const hit = hitTestSprite(imagePos, sprites);
            if (hit) {
                const sprite = sprites.find(candidate => candidate.id === hit)!;
                propsRef.current.onSelectSprite(hit);
                interactionRef.current = {type: "move", spriteId: hit, startRegion: {...sprite}, startImage: imagePos};
                setCanvasCursor("move");
            } else {
                propsRef.current.onSelectSprite(null);
                beginPan(screen);
            }
        }
    }

    function handlePointerMove(event: ReactPointerEvent<HTMLCanvasElement>) {
        const imagePos = toImage(event);
        const screen = toScreen(event);
        const {imageSize, tool} = propsRef.current;

        if (statusRef.current) {
            const x = Math.round(imagePos.x);
            const y = Math.round(imagePos.y);
            const inside = x >= 0 && y >= 0 && x < imageSize.width && y < imageSize.height;
            statusRef.current.textContent = `x: ${x}, y: ${y}${inside ? "" : " (outside)"}`;
        }

        const interaction = interactionRef.current;
        if (!interaction) {
            if (tool === "select") {
                const hit = hitTestSprite(imagePos, propsRef.current.sprites);
                setHoverSpriteId(prev => prev === hit ? prev : hit);
                setCanvasCursor(selectCursor(screen, imagePos));
            } else {
                setHoverSpriteId(null);
                setCanvasCursor(defaultCursor(tool));
            }
            return;
        }

        switch (interaction.type) {
            case "pan": {
                const {viewport, onSetViewport} = propsRef.current;
                onSetViewport({
                    ...viewport,
                    x: interaction.startPan.x + (screen.x - interaction.startScreen.x),
                    y: interaction.startPan.y + (screen.y - interaction.startScreen.y),
                });
                break;
            }
            case "draw": {
                const current = clampPointToImage(snapPoint(imagePos), propsRef.current.imageSize);
                setDraft(rectFromPoints(interaction.start, current));
                break;
            }
            case "move": {
                const dx = imagePos.x - interaction.startImage.x;
                const dy = imagePos.y - interaction.startImage.y;
                propsRef.current.onUpdateSprite(
                    interaction.spriteId,
                    clampMove(interaction.startRegion, dx, dy, propsRef.current.imageSize),
                );
                break;
            }
            case "resize": {
                propsRef.current.onUpdateSprite(
                    interaction.spriteId,
                    clampResize(interaction.startRegion, interaction.handle, imagePos, propsRef.current.imageSize),
                );
                break;
            }
        }
    }

    function handlePointerUp(event: ReactPointerEvent<HTMLCanvasElement>) {
        const canvas = canvasRef.current;
        if (canvas && canvas.hasPointerCapture(event.pointerId)) {
            canvas.releasePointerCapture(event.pointerId);
        }
        const interaction = interactionRef.current;
        interactionRef.current = null;
        if (interaction?.type === "draw" && draft) {
            propsRef.current.onCreateSprite(draft);
        }
        setDraft(null);
        setCanvasCursor(defaultCursor(propsRef.current.tool));
    }

    function handlePointerCancel() {
        interactionRef.current = null;
        setDraft(null);
        setCanvasCursor(defaultCursor(propsRef.current.tool));
    }

    function handlePointerLeave() {
        if (statusRef.current) {
            statusRef.current.textContent = "";
        }
        if (!interactionRef.current) {
            setHoverSpriteId(null);
            setCanvasCursor(defaultCursor(propsRef.current.tool));
        }
    }

    return (
        <div ref={containerRef} className="atlas-canvas">
            <canvas
                ref={canvasRef}
                className="atlas-canvas__surface"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerCancel}
                onPointerLeave={handlePointerLeave}
                onMouseDown={event => {
                    if (event.button === 1) {
                        event.preventDefault();
                    }
                }}
                onAuxClick={event => {
                    if (event.button === 1) {
                        event.preventDefault();
                    }
                }}
            />
            <div className="atlas-canvas__status">
                <span ref={statusRef}/>
            </div>
        </div>
    );
}
