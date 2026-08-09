import type {AtlasEditor} from "@pages/dev/atlastool/app/atlas.editor.ts";
import {type PointerEvent as ReactPointerEvent, type RefObject, useEffect, useEffectEvent, useRef, useState} from "react";
import type {AtlasTool, Point, Rect, ResizeHandle, SpriteRegion, Viewport} from "@pages/dev/atlastool/app/atlas.types.ts";
import {
    clampMove,
    clampPointToImage,
    clampResize,
    hitTestEdge,
    hitTestSprite,
    rectFromPoints,
    snapPoint,
    toImage,
    toScreen,
    ZOOM_LEVEL_STEP,
    zoomAt,
    zoomFromLevel,
    zoomToLevel,
} from "@pages/dev/atlastool/app/atlas.geometry.ts";
import {renderCanvas} from "@pages/dev/atlastool/app/atlas.canvas-render.ts";

type Interaction =
    | { type: "pan", startScreen: Point, startPan: { x: number, y: number } }
    | { type: "draw", start: Point }
    | { type: "move", spriteId: string, startRegion: Rect, startImage: Point }
    | { type: "resize", spriteId: string, handle: ResizeHandle, startRegion: Rect };


export function useAtlasCanvas(editor: AtlasEditor<true>, externalCanvasRef?: RefObject<HTMLCanvasElement | null>) {

    const internalCanvasRef = useRef<HTMLCanvasElement>(null);
    const canvasRef = externalCanvasRef ?? internalCanvasRef;
    const containerRef = useRef<HTMLDivElement>(null);

    const interactionRef = useRef<Interaction | null>(null);

    const [hoverSpriteId, setHoverSpriteId] = useState<string | null>(null);
    const [cursorPoint, setCursorPoint] = useState<Point | null>(null);
    const [draft, setDraft] = useState<Rect | null>(null);
    const [, setSizeTick] = useState(0);

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

        if (event.button === 2) { // right mouse button
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

        const pointScreen = toScreen(event, canvas);
        const pointImage = toImage(event, canvas, editor.project.viewport.value);
        setCursorPoint(pointImage);

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

        if (interaction?.type === "draw") {
            endInteractionDraw(interaction);
            return;
        }

        if (editor.project.tool.active === "select") {
            const pointScreen = toScreen(event, canvas);
            const pointImage = toImage(event, canvas, editor.project.viewport.value);
            setCanvasCursor(selectCursor(pointScreen, pointImage, editor.project.sprites.list, editor.project.sprites.selectedId, editor.project.viewport.value));
        } else {
            setCanvasCursor(defaultCursor(editor.project.tool.active));
        }
    }


    function handlePointerCancel(_event: ReactPointerEvent<HTMLCanvasElement>) {
        interactionRef.current = null;
        setDraft(null);
        setCursorPoint(null);
        setCanvasCursor(defaultCursor(editor.project.tool.active));
    }


    function handlePointerLeave(_event: ReactPointerEvent<HTMLCanvasElement>) {
        setCursorPoint(null);
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

    const handleWheel = useEffectEvent((event: WheelEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        event.preventDefault();
        const viewport = editor.project.viewport.value;
        const rect = canvas.getBoundingClientRect();
        const screen = {x: event.clientX - rect.left, y: event.clientY - rect.top};
        const levelStep = event.deltaY < 0 ? ZOOM_LEVEL_STEP : -ZOOM_LEVEL_STEP;
        const nextZoom = zoomFromLevel(zoomToLevel(viewport.zoom) + levelStep);
        editor.project.viewport.set(zoomAt(viewport, screen, nextZoom));
    });

    //=========== TOOL SELECT ============================================================

    function startToolSelect(_event: ReactPointerEvent<HTMLCanvasElement>, pointScreen: Point, pointImage: Point) {
        const selectedSprite = editor.project.sprites.selected;
        if (selectedSprite && !selectedSprite.locked) {
            const edgeHandle = hitTestEdge(pointScreen, selectedSprite, editor.project.viewport.value);
            if (edgeHandle) {
                startInteractionResize(selectedSprite, edgeHandle);
                return;
            }
        }
        const hitSpriteId = hitTestSprite(pointImage, editor.project.sprites.list);
        if (hitSpriteId) {
            const hitSprite = editor.project.sprites.list.find(sprite => sprite.id === hitSpriteId)!;
            if (hitSprite.locked) {
                editor.project.sprites.select(hitSpriteId);
                startInteractionPan(pointScreen);
            } else {
                startInteractionMove(hitSpriteId, pointImage);
            }
        } else {
            editor.project.sprites.select(null);
            startInteractionPan(pointScreen);
        }
    }

    //=========== TOOL DRAW ==============================================================

    function startToolDraw(_event: ReactPointerEvent<HTMLCanvasElement>, _pointScreen: Point, pointImage: Point) {
        startInteractionDraw(pointImage);
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

    function startInteractionDraw(pointImage: Point) {
        const start = clampPointToImage(snapPoint(pointImage), editor.project.images.size);
        interactionRef.current = {type: "draw", start};
        setDraft(rectFromPoints(start, start));
        setCanvasCursor("crosshair");
    }

    function continueInteractionDraw(pointImage: Point, interaction: { type: "draw", start: Point }) {
        const current = clampPointToImage(snapPoint(pointImage), editor.project.images.size);
        setDraft(rectFromPoints(interaction.start, current));
    }

    function endInteractionDraw(_interaction: { type: "draw"; start: Point }) {
        if (draft) {
            editor.project.sprites.create(draft);
            setDraft(null);
        }
    }

    //=========== INTERACTION MOVE =======================================================

    function startInteractionMove(spriteId: string, pointImage: Point) {
        const sprite = editor.project.sprites.list.find(it => it.id === spriteId)!;
        interactionRef.current = {type: "move", spriteId: spriteId, startRegion: {...sprite}, startImage: pointImage};
        editor.project.sprites.select(spriteId);
        setCanvasCursor("move");
    }

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
            clampMove(interaction.startRegion, dx, dy, editor.project.images.size),
        );
    }

    //=========== INTERACTION RESIZE =====================================================

    function startInteractionResize(sprite: SpriteRegion, edgeHandle: ResizeHandle) {
        interactionRef.current = {
            type: "resize",
            spriteId: sprite.id,
            handle: edgeHandle,
            startRegion: {...sprite},
        };
        setCanvasCursor(RESIZE_CURSORS[edgeHandle]);
    }

    function continueInteractionResize(pointImage: Point, interaction: {
        type: "resize",
        spriteId: string,
        handle: ResizeHandle,
        startRegion: Rect
    }) {
        editor.project.sprites.updateRegion(
            interaction.spriteId,
            clampResize(interaction.startRegion, interaction.handle, pointImage, editor.project.images.size),
        );
    }

    //=========== RENDER =================================================================

    function render() {
        const canvas = canvasRef.current;
        if (!canvas) return;
        renderCanvas(editor, canvas, hoverSpriteId, draft);
    }

    //=========== MISCELLANEOUS ==========================================================

    function setCanvasCursor(cursor: string) {
        const canvas = canvasRef.current;
        if (canvas) {
            canvas.style.cursor = cursor;
        }
    }

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            canvas.style.cursor = defaultCursor(editor.project.tool.active);
        }
    }, [editor.project.tool.active, canvasRef]);

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
        const onWheel = (event: WheelEvent) => handleWheel(event);
        canvas.addEventListener("wheel", onWheel, {passive: false});
        return () => canvas.removeEventListener("wheel", onWheel);
    }, [canvasRef]);

    useEffect(() => {
        render();
    });

    return {
        hoverSpriteId: hoverSpriteId,
        cursorPoint: cursorPoint,
        canvasRef: canvasRef,
        containerRef: containerRef,
        onPointerDown: handlePointerDown,
        onPointerMove: handlePointerMove,
        onPointerUp: handlePointerUp,
        onPointerCancel: handlePointerCancel,
        onPointerLeave: handlePointerLeave,
        onMouseDown: handleMouseDown,
        onAuxClick: handleAuxClick,
        render: render,
    };
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
        if (selected && !selected.locked) {
            const handle = hitTestEdge(pointScreen, selected, viewport);
            if (handle) {
                return RESIZE_CURSORS[handle];
            }
        }
    }
    if (hit) {
        const hitSprite = sprites.find(sprite => sprite.id === hit)!;
        return hitSprite.locked ? "default" : "move";
    }
    return "default";
}


function defaultCursor(tool: AtlasTool): string {
    switch (tool) {
        case "select": return "default";
        case "draw": return "crosshair";
        case "pan": return "grab";
    }
}

