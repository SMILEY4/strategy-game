import type {GameRendererDataProvider} from "@pages/game/renderer/data/game-renderer-data-provider.ts";
import type {RenderGraphBuilder} from "@modules/rendergraph/render-graph-builder.ts";
import type {RenderWasmApi} from "@pages/game/renderer/wasm/render-wasm-api.ts";
import {gameGraphDataCamera} from "@pages/game/renderer/graph/camera-data.ts";
import {gameGraphDataWorld} from "@pages/game/renderer/graph/world-data.ts";
import type {VersionedContainer} from "@pages/game/renderer/data/versioned-data.ts";
import type {DebugData} from "@app/features/game/database/debug.database.ts";
import {renderBaseTerrainMask} from "@pages/game/renderer/graph/render-base-terrain-mask.ts";
import {renderBaseTerrain} from "@pages/game/renderer/graph/render-base-terrain.ts";
import {GLColorStoreFormat, GLDepthStoreFormat} from "@modules/rendergraph/webgl/gl-framebuffer.ts";
import {debugVisRendertarget} from "@pages/game/renderer/graph/debug-rendertarget.ts";
import {renderMapDetails} from "@pages/game/renderer/graph/render-map-details.ts";
import {renderOverlay} from "@pages/game/renderer/graph/render-overlay.ts";
import {renderTileHighlight} from "@pages/game/renderer/graph/render-tile-highlight.ts";
import {renderTileGrid} from "@pages/game/renderer/graph/render-tile-grid.ts";
import {gameGraphHtml} from "@pages/game/renderer/graph/html.ts";
import {renderRoutes} from "@pages/game/renderer/graph/render-routes.ts";
import type {PointerPosition} from "@app/features/game/database/pointer-position.database.ts";

export function gameGraph(g: RenderGraphBuilder, dataProvider: GameRendererDataProvider, wasmApi: RenderWasmApi) {

    //======================  COMMON ========================================

    const dataDebug = g.dataExternal<VersionedContainer<DebugData>>(
        (prev) => prev?.revId !== dataProvider.getDebugData().revId,
        () => dataProvider.getDebugData().load(),
    );

    const {dataCamera, camera} = gameGraphDataCamera(g, dataProvider);

    const dataPointerPosition = g.dataExternal<VersionedContainer<PointerPosition>>(
        prev => prev?.revId !== dataProvider.getPointerPosition().revId,
        () => dataProvider.getPointerPosition().load(),
    );

    const dataPointerHexPosition = g.dataTransformer(
        g.transform({
            inputs: [dataPointerPosition],
            func: (data) => data.data.hex,
        }),
    );

    const dataPointerWorldPosition = g.dataTransformer(
        g.transform({
            inputs: [dataPointerPosition],
            func: (data) => data.data.world,
        }),
    );

    const {
        wasmVisibleChunks,
        // wasmTileFogOfWarInstances,
        warmTileLandInstances,
        wasmTileWaterInstances,
        wasmWaterEdgeInstances,
        wasmMapDetailVertices,
        wasmRouteVertices
    } = gameGraphDataWorld(g, dataProvider, wasmApi, {
        dataCamera: dataCamera,
    });

    //======================  BASE TERRAIN MASK =============================

    const renderTargetBaseTerrainMask = renderBaseTerrainMask(g, wasmApi, {
        dataDebug: dataDebug,
        camera: camera,
        wasmWaterEdgeInstances: wasmWaterEdgeInstances,
        warmTileLandInstances: warmTileLandInstances,
    });

    //====================== BASE TERRAIN ===================================

    const {drawWaterTiles, drawLandTiles} = renderBaseTerrain(g, wasmApi, {
        dataDebug: dataDebug,
        camera: camera,
        warmTileLandInstances: warmTileLandInstances,
        wasmTileWaterInstances: wasmTileWaterInstances,
        renderTargetBaseTerrainMask: renderTargetBaseTerrainMask,
    });

    //====================== MAP DETAILS ====================================

    const {drawMapDetails} = renderMapDetails(g, wasmApi, {
        dataDebug: dataDebug,
        camera: camera,
        cameraData: dataCamera,
        wasmMapDetailVertices: wasmMapDetailVertices,
    });

    //====================== ROUTES =========================================

    const {drawRoutes} = renderRoutes(g, wasmApi, {
        dataDebug: dataDebug,
        camera: camera,
        wasmRouteVertices: wasmRouteVertices,
        renderTargetBaseTerrainMask: renderTargetBaseTerrainMask
    });
    //====================== FOG OF WAR =====================================

    // const renderTargetFogOfWarMask = renderFogOfWar(g, wasmApi, {
    //     dataDebug: dataDebug,
    //     camera: camera,
    //     wasmTileFogOfWarInstances: wasmTileFogOfWarInstances
    // })

    //====================== TILE GRID ======================================

    const {drawTileGrid} = renderTileGrid(g, wasmApi, {
        dataDebug: dataDebug,
        camera: camera,
        dataPointerHexPosition: dataPointerHexPosition,
        dataPointerWorldPosition: dataPointerWorldPosition,
    })


    //====================== OVERLAY ========================================

    const {
        drawOverlayFill,
        drawOverlayBorderBack,
        drawOverlayBorderFront,
        drawRouteHighlight,
    } = renderOverlay(g, dataProvider, wasmApi, {
        dataDebug: dataDebug,
        camera: camera,
        visibleChunks: wasmVisibleChunks,
    });


    //====================== SELECTED TILE ==================================

    const {drawSelectedTileBack, drawSelectedTileFront} = renderTileHighlight(g, dataProvider, {
        dataDebug: dataDebug,
        camera: camera,
        dataPointerHexPosition: dataPointerHexPosition,
    });

    //====================== WEBGL OUTPUT ===================================

    const canvasSize = g.canvasSize();

    const renderTargetComposite = g.rendertarget({
        size: canvasSize,
        renderPasses: [
            drawWaterTiles,
            drawLandTiles,
            drawRoutes,
            drawMapDetails,
            drawTileGrid,
            drawOverlayFill,
            drawOverlayBorderBack,
            drawOverlayBorderFront,
            drawRouteHighlight,
            drawSelectedTileBack,
            drawSelectedTileFront,
        ],
        attachments: {
            color: {
                type: "color",
                format: GLColorStoreFormat.RGBA_8,
            },
            depth: {
                type: "depth",
                format: GLDepthStoreFormat.DEPTH_COMPONENT32F,
            },
        },
        clearColor: [0, 0, 0, 0],
    });

    const drawDebugVis = debugVisRendertarget(g, renderTargetComposite);

    g.canvas({
        renderPasses: [drawDebugVis],
        clearColor: [0, 0, 0, 1],
    });

    //====================== HTML OUTPUT ====================================

    const {htmlDraw} = gameGraphHtml(g, dataProvider, {
        dataCamera: dataCamera,
    });

    g.htmlContainer({
        elementId: "game-overlay",
        renderPasses: [htmlDraw],
    });

    return g.getNodes();
}

