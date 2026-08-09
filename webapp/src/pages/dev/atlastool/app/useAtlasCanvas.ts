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
import type {AtlasEditorProject} from "@pages/dev/atlastool/app/useAtlasEditor.ts";

type Interaction =
    | { type: "pan", startScreen: Point, startPan: { x: number, y: number } }
    | { type: "draw", start: Point }
    | { type: "move", spriteId: string, startRegion: Rect, startImage: Point }
    | { type: "resize", spriteId: string, handle: ResizeHandle, startRegion: Rect };


export function useAtlasCanvas(project: AtlasEditorProject, externalCanvasRef?: RefObject<HTMLCanvasElement | null>) {

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
        const pointImage = toImage(event, canvas, project.viewport.value);

        if (event.button === 1) { // middle mouse button
            startToolPan(event, pointScreen, pointImage);
            return;
        }

        if (event.button === 2) { // right mouse button
            return;
        }

        if (project.tool.active === "Select") {
            startToolSelect(event, pointScreen, pointImage);
            return;
        }
        if (project.tool.active === "Draw") {
            startToolDraw(event, pointScreen, pointImage);
            return;
        }
        if (project.tool.active === "Pan") {
            startToolPan(event, pointScreen, pointImage);
            return;
        }
    }

    function handlePointerMove(event: ReactPointerEvent<HTMLCanvasElement>) {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const pointScreen = toScreen(event, canvas);
        const pointImage = toImage(event, canvas, project.viewport.value);
        setCursorPoint(pointImage);

        const interaction = interactionRef.current;

        if (interaction == null) {
            if (project.tool.active === "Select") {
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

        if (interaction?.type === "move") {
            endInteractionMove();
            return;
        }

        if (interaction?.type === "resize") {
            endInteractionResize();
            return;
        }

        if (project.tool.active === "Select") {
            const pointScreen = toScreen(event, canvas);
            const pointImage = toImage(event, canvas, project.viewport.value);
            setCanvasCursor(selectCursor(pointScreen, pointImage, project.sprites.list, project.sprites.selected?.id, project.viewport.value));
        } else {
            setCanvasCursor(defaultCursor(project.tool.active));
        }
    }


    function handlePointerCancel(event: ReactPointerEvent<HTMLCanvasElement>) {
        handlePointerUp(event);
    }


    function handlePointerLeave(_event: ReactPointerEvent<HTMLCanvasElement>) {
        setCursorPoint(null);
        if (!interactionRef.current) {
            setHoverSpriteId(null);
            setCanvasCursor(defaultCursor(project.tool.active));
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
        const viewport = project.viewport.value;
        const rect = canvas.getBoundingClientRect();
        const screen = {x: event.clientX - rect.left, y: event.clientY - rect.top};
        const levelStep = event.deltaY < 0 ? ZOOM_LEVEL_STEP : -ZOOM_LEVEL_STEP;
        const nextZoom = zoomFromLevel(zoomToLevel(viewport.zoom) + levelStep);
        project.viewport.update(zoomAt(viewport, screen, nextZoom));
    });

    //=========== TOOL SELECT ============================================================

    function startToolSelect(_event: ReactPointerEvent<HTMLCanvasElement>, pointScreen: Point, pointImage: Point) {
        const selectedSprite = project.sprites.selected;
        if (selectedSprite && !selectedSprite.locked) {
            const edgeHandle = hitTestEdge(pointScreen, selectedSprite, project.viewport.value);
            if (edgeHandle) {
                startInteractionResize(selectedSprite, edgeHandle);
                return;
            }
        }
        const hitSpriteId = hitTestSprite(pointImage, project.sprites.list);
        if (hitSpriteId) {
            const hitSprite = project.sprites.list.find(sprite => sprite.id === hitSpriteId)!;
            if (hitSprite.locked) {
                project.sprites.select(hitSpriteId);
                startInteractionPan(pointScreen);
            } else {
                startInteractionMove(hitSpriteId, pointImage);
            }
        } else {
            project.sprites.select(null);
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
        const hit = hitTestSprite(pointImage, project.sprites.list);
        setHoverSpriteId(prev => prev === hit ? prev : hit);
        setCanvasCursor(selectCursor(pointScreen, pointImage, project.sprites.list, project.sprites.selected?.id, project.viewport.value));
    }

    function endInteractionHoverSprite() {
        setHoverSpriteId(null);
        setCanvasCursor(defaultCursor(project.tool.active));
    }

    //=========== INTERACTION PAN ========================================================

    function startInteractionPan(pointScreen: Point) {
        interactionRef.current = {
            type: "pan",
            startScreen: pointScreen,
            startPan: {x: project.viewport.value.x, y: project.viewport.value.y},
        };
        setCanvasCursor("grabbing");
    }

    function continueInteractionPan(pointScreen: Point, interaction: {
        type: "pan",
        startScreen: Point,
        startPan: { x: number, y: number }
    }) {
        project.viewport.update({
            x: interaction.startPan.x + (pointScreen.x - interaction.startScreen.x),
            y: interaction.startPan.y + (pointScreen.y - interaction.startScreen.y),
        });
    }

    //=========== INTERACTION DRAW =======================================================

    function startInteractionDraw(pointImage: Point) {
        const start = clampPointToImage(snapPoint(pointImage), project.atlas.size);
        interactionRef.current = {type: "draw", start};
        setDraft(rectFromPoints(start, start));
        setCanvasCursor("crosshair");
    }

    function continueInteractionDraw(pointImage: Point, interaction: { type: "draw", start: Point }) {
        const current = clampPointToImage(snapPoint(pointImage), project.atlas.size);
        setDraft(rectFromPoints(interaction.start, current));
    }

    function endInteractionDraw(_interaction: { type: "draw"; start: Point }) {
        if (draft) {
            project.sprites.create(draft);
            setDraft(null);
        }
    }

    //=========== INTERACTION MOVE =======================================================

    function startInteractionMove(spriteId: string, pointImage: Point) {
        const sprite = project.sprites.list.find(it => it.id === spriteId)!;
        project.history.beginBatch();
        interactionRef.current = {type: "move", spriteId: spriteId, startRegion: {...sprite}, startImage: pointImage};
        project.sprites.select(spriteId);
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
        project.sprites.updateRegion(
            interaction.spriteId,
            clampMove(interaction.startRegion, dx, dy, project.atlas.size),
        );
    }

    function endInteractionMove() {
        project.history.endBatch();
    }

    //=========== INTERACTION RESIZE =====================================================

    function startInteractionResize(sprite: SpriteRegion, edgeHandle: ResizeHandle) {
        project.history.beginBatch();
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
        project.sprites.updateRegion(
            interaction.spriteId,
            clampResize(interaction.startRegion, interaction.handle, pointImage, project.atlas.size),
        );
    }

    function endInteractionResize() {
        project.history.endBatch();
    }

    //=========== RENDER =================================================================

    function render() {
        const canvas = canvasRef.current;
        if (!canvas) return;
        renderCanvas(project, canvas, hoverSpriteId, draft);
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
            canvas.style.cursor = defaultCursor(project.tool.active);
        }
    }, [project.tool.active, canvasRef]);

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

function selectCursor(pointScreen: Point, pointImage: Point, sprites: SpriteRegion[], selectedSpriteId: string | undefined, viewport: Viewport): string {
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
        case "Select":
            return "default";
        case "Draw":
            return "crosshair";
        case "Pan":
            return "grab";
    }
}

