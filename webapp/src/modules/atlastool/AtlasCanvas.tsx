import {useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactElement} from "react";
import type {AtlasTool, Rect, SpriteRegion} from "./atlas.types.ts";
import {
    clampMove,
    clampPointToImage,
    clampResize,
    normalizeRect,
    snapPoint,
    ZOOM_LEVEL_STEP,
    zoomFromLevel,
    zoomToLevel,
    type ResizeHandle,
} from "./atlas.geometry.ts";

const HANDLE_SIZE = 8;
const EDGE_THRESHOLD = 6;
const MIN_GRID_ZOOM = 3;

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
    imageWidth: number;
    imageHeight: number;
    sprites: SpriteRegion[];
    selectedSpriteId: string | null;
    tool: AtlasTool;
    zoom: number;
    pan: { x: number, y: number };
    onSelectSprite: (id: string | null) => void;
    onCreateSprite: (region: Rect) => void;
    onUpdateSprite: (id: string, region: Rect) => void;
    onSetZoom: (zoom: number) => void;
    onSetPan: (pan: { x: number, y: number }) => void;
}

type Interaction =
    | { type: "pan", startScreen: { x: number, y: number }, startPan: { x: number, y: number } }
    | { type: "draw", start: { x: number, y: number } }
    | { type: "move", spriteId: string, startRegion: Rect, startImage: { x: number, y: number } }
    | { type: "resize", spriteId: string, handle: ResizeHandle, startRegion: Rect };

type PropsRef = {
    image: HTMLImageElement | null;
    imageWidth: number;
    imageHeight: number;
    sprites: SpriteRegion[];
    selectedSpriteId: string | null;
    tool: AtlasTool;
    zoom: number;
    pan: { x: number, y: number };
    onSelectSprite: (id: string | null) => void;
    onCreateSprite: (region: Rect) => void;
    onUpdateSprite: (id: string, region: Rect) => void;
    onSetZoom: (zoom: number) => void;
    onSetPan: (pan: { x: number, y: number }) => void;
};

function hitTestEdge(screen: { x: number, y: number }, region: Rect, zoom: number, pan: { x: number, y: number }): ResizeHandle | null {
    const x0 = pan.x + region.x * zoom;
    const y0 = pan.y + region.y * zoom;
    const x1 = x0 + region.width * zoom;
    const y1 = y0 + region.height * zoom;
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

function hitTestSprite(imagePos: { x: number, y: number }, sprites: SpriteRegion[]): string | null {
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

function strokeRect(ctx: CanvasRenderingContext2D, region: Rect, zoom: number, pan: { x: number, y: number }, color: string, lineWidth: number) {
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.strokeRect(pan.x + region.x * zoom, pan.y + region.y * zoom, region.width * zoom, region.height * zoom);
}

export function AtlasCanvas(props: AtlasCanvasProps): ReactElement {

    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const statusRef = useRef<HTMLSpanElement>(null);
    const propsRef = useRef<PropsRef>(props);
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
            const {zoom, pan, onSetZoom, onSetPan} = propsRef.current;
            const rect = canvas.getBoundingClientRect();
            const sx = event.clientX - rect.left;
            const sy = event.clientY - rect.top;
            const levelStep = event.deltaY < 0 ? ZOOM_LEVEL_STEP : -ZOOM_LEVEL_STEP;
            const nextZoom = zoomFromLevel(zoomToLevel(zoom) + levelStep);
            const imageX = (sx - pan.x) / zoom;
            const imageY = (sy - pan.y) / zoom;
            onSetZoom(nextZoom);
            onSetPan({x: sx - imageX * nextZoom, y: sy - imageY * nextZoom});
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
        const {image, imageWidth, imageHeight, sprites, selectedSpriteId, zoom, pan} = propsRef.current;
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
        ctx.fillStyle = "#1e2024";
        ctx.fillRect(0, 0, cssWidth, cssHeight);

        if (!image || imageWidth <= 0 || imageHeight <= 0) {
            ctx.fillStyle = "#7a8290";
            ctx.font = "14px sans-serif";
            ctx.fillText("No image loaded", 16, 28);
            return;
        }

        const scaledWidth = imageWidth * zoom;
        const scaledHeight = imageHeight * zoom;
        ctx.imageSmoothingEnabled = !(Number.isInteger(zoom) && zoom >= 1);
        ctx.drawImage(image, pan.x, pan.y, scaledWidth, scaledHeight);
        ctx.imageSmoothingEnabled = true;

        ctx.strokeStyle = "rgba(255,255,255,0.6)";
        ctx.lineWidth = 1;
        ctx.strokeRect(pan.x, pan.y, scaledWidth, scaledHeight);

        if (zoom >= MIN_GRID_ZOOM) {
            ctx.strokeStyle = "rgba(255,255,255,0.08)";
            ctx.lineWidth = 1;
            const firstCol = Math.max(1, Math.ceil((0 - pan.x) / zoom));
            for (let col = firstCol; col < imageWidth; col++) {
                const x = Math.round(pan.x + col * zoom) + 0.5;
                if (x > cssWidth) {
                    break;
                }
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, cssHeight);
                ctx.stroke();
            }
            const firstRow = Math.max(1, Math.ceil((0 - pan.y) / zoom));
            for (let row = firstRow; row < imageHeight; row++) {
                const y = Math.round(pan.y + row * zoom) + 0.5;
                if (y > cssHeight) {
                    break;
                }
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(cssWidth, y);
                ctx.stroke();
            }
        }

        for (const sprite of sprites) {
            const selected = sprite.id === selectedSpriteId;
            if (selected) {
                ctx.fillStyle = "rgba(0,150,255,0.2)";
                ctx.fillRect(pan.x + sprite.x * zoom, pan.y + sprite.y * zoom, sprite.width * zoom, sprite.height * zoom);
            }
            strokeRect(ctx, sprite, zoom, pan, selected ? "#2ea6ff" : "rgba(255,90,90,0.9)", selected ? 2 : 1);
            if (selected) {
                const x0 = pan.x + sprite.x * zoom;
                const y0 = pan.y + sprite.y * zoom;
                const x1 = x0 + sprite.width * zoom;
                const y1 = y0 + sprite.height * zoom;
                const corners = [{x: x0, y: y0}, {x: x1, y: y0}, {x: x1, y: y1}, {x: x0, y: y1}];
                for (const corner of corners) {
                    ctx.fillStyle = "#ffffff";
                    ctx.fillRect(corner.x - HANDLE_SIZE / 2, corner.y - HANDLE_SIZE / 2, HANDLE_SIZE, HANDLE_SIZE);
                    ctx.strokeStyle = "#2ea6ff";
                    ctx.lineWidth = 1;
                    ctx.strokeRect(corner.x - HANDLE_SIZE / 2, corner.y - HANDLE_SIZE / 2, HANDLE_SIZE, HANDLE_SIZE);
                }
            }
        }

        if (draft) {
            strokeRect(ctx, draft, zoom, pan, "rgba(0,200,255,0.95)", 2);
        }

        if (hoverSpriteId && hoverSpriteId !== selectedSpriteId) {
            const hovered = sprites.find(sprite => sprite.id === hoverSpriteId);
            if (hovered) {
                strokeRect(ctx, hovered, zoom, pan, "rgba(255,255,255,0.7)", 1);
            }
        }
    }

    function toScreen(event: { clientX: number, clientY: number }): { x: number, y: number } {
        const rect = canvasRef.current!.getBoundingClientRect();
        return {x: event.clientX - rect.left, y: event.clientY - rect.top};
    }

    function toImage(event: { clientX: number, clientY: number }): { x: number, y: number } {
        const screen = toScreen(event);
        const {zoom, pan} = propsRef.current;
        return {x: (screen.x - pan.x) / zoom, y: (screen.y - pan.y) / zoom};
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

    function handlePointerDown(event: ReactPointerEvent<HTMLCanvasElement>) {
        const canvas = canvasRef.current;
        if (!canvas) {
            return;
        }
        canvas.setPointerCapture(event.pointerId);
        const screen = toScreen(event);
        const imagePos = toImage(event);
        const {tool, pan, zoom, sprites, selectedSpriteId} = propsRef.current;

        if (event.button === 1) {
            event.preventDefault();
            interactionRef.current = {type: "pan", startScreen: screen, startPan: pan};
            setCanvasCursor("grabbing");
            return;
        }

        if (tool === "pan") {
            interactionRef.current = {type: "pan", startScreen: screen, startPan: pan};
            setCanvasCursor("grabbing");
            return;
        }

        if (tool === "draw") {
            const start = clampPointToImage(snapPoint(imagePos), propsRef.current.imageWidth, propsRef.current.imageHeight);
            interactionRef.current = {type: "draw", start};
            setDraft(normalizeRect(start, start));
            setCanvasCursor("crosshair");
            return;
        }

        if (tool === "select") {
            if (selectedSpriteId) {
                const selected = sprites.find(sprite => sprite.id === selectedSpriteId);
                if (selected) {
                    const handle = hitTestEdge(screen, selected, zoom, pan);
                    if (handle) {
                        interactionRef.current = {type: "resize", spriteId: selected.id, handle, startRegion: {...selected}};
                        setCanvasCursor(RESIZE_CURSORS[handle]);
                        return;
                    }
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
                interactionRef.current = {type: "pan", startScreen: screen, startPan: pan};
                setCanvasCursor("grabbing");
            }
        }
    }

    function handlePointerMove(event: ReactPointerEvent<HTMLCanvasElement>) {
        const imagePos = toImage(event);
        const screen = toScreen(event);
        const {imageWidth, imageHeight, tool, zoom, sprites, selectedSpriteId} = propsRef.current;

        if (statusRef.current) {
            const sx = Math.round(imagePos.x);
            const sy = Math.round(imagePos.y);
            const inside = sx >= 0 && sy >= 0 && sx < imageWidth && sy < imageHeight;
            statusRef.current.textContent = `x: ${sx}, y: ${sy}${inside ? "" : " (outside)"}`;
        }

        const interaction = interactionRef.current;
        if (!interaction) {
            if (tool === "select") {
                const hit = hitTestSprite(imagePos, sprites);
                setHoverSpriteId(prev => prev === hit ? prev : hit);
                let cursor = "crosshair";
                if (selectedSpriteId) {
                    const selected = sprites.find(sprite => sprite.id === selectedSpriteId);
                    if (selected) {
                        const handle = hitTestEdge(screen, selected, zoom, pan);
                        if (handle) {
                            cursor = RESIZE_CURSORS[handle];
                        } else if (hit) {
                            cursor = "move";
                        }
                    }
                } else if (hit) {
                    cursor = "move";
                }
                setCanvasCursor(cursor);
            } else if (tool === "pan") {
                setHoverSpriteId(null);
                setCanvasCursor("grab");
            } else {
                setHoverSpriteId(null);
                setCanvasCursor("crosshair");
            }
            return;
        }

        switch (interaction.type) {
            case "pan": {
                propsRef.current.onSetPan({
                    x: interaction.startPan.x + (screen.x - interaction.startScreen.x),
                    y: interaction.startPan.y + (screen.y - interaction.startScreen.y),
                });
                break;
            }
            case "draw": {
                const current = clampPointToImage(snapPoint(imagePos), propsRef.current.imageWidth, propsRef.current.imageHeight);
                setDraft(normalizeRect(interaction.start, current));
                break;
            }
            case "move": {
                const dx = imagePos.x - interaction.startImage.x;
                const dy = imagePos.y - interaction.startImage.y;
                propsRef.current.onUpdateSprite(
                    interaction.spriteId,
                    clampMove(interaction.startRegion, dx, dy, propsRef.current.imageWidth, propsRef.current.imageHeight),
                );
                break;
            }
            case "resize": {
                propsRef.current.onUpdateSprite(
                    interaction.spriteId,
                    clampResize(interaction.startRegion, interaction.handle, imagePos, propsRef.current.imageWidth, propsRef.current.imageHeight),
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
