import type {GameRendererDataProvider} from "@pages/game/renderer/data/game-renderer-data-provider.ts";
import type {RenderGraphBuilder} from "@modules/rendergraph/render-graph-builder.ts";
import type {RenderWasmApi} from "@pages/game/renderer/wasm/render-wasm-api.ts";
import {gameGraphDataCamera} from "@pages/game/renderer/graph/camera-data.ts";
import {gameGraphDataWorld} from "@pages/game/renderer/graph/world-data.ts";
import type {VersionedContainer} from "@pages/game/renderer/data/versioned-data.ts";
import type {DebugData} from "@app/features/game/database/debug.database.ts";
import {GLColorStoreFormat} from "@modules/rendergraph/webgl/gl-texture-attachment.ts";
import {debugVisRendertarget} from "@pages/game/renderer/graph/debug-rendertarget.ts";
import type {PointerPosition} from "@app/features/game/database/pointer-position.database.ts";
import {renderPassWorld} from "@pages/game/renderer/graph/world/render-pass.world.ts";
import {renderWorldPostProcess} from "@pages/game/renderer/graph/world/render.world-post-process.ts";
import {renderTileHighlight} from "@pages/game/renderer/graph/overlay/render.tile-highlight.ts";
import {renderOverlay} from "@pages/game/renderer/graph/overlay/render.overlay.ts";
import {renderTileGrid} from "@pages/game/renderer/graph/overlay/render.tile-grid.ts";
import {gameGraphHtml} from "@pages/game/renderer/graph/html.ts";

export function gameGraph(g: RenderGraphBuilder, dataProvider: GameRendererDataProvider, wasmApi: RenderWasmApi) {

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
        wasmTileFogOfWarInstances,
        warmTileLandInstances,
        wasmTileWaterInstances,
        wasmWaterEdgeInstances,
        wasmMapDetailVertices,
        wasmRouteVertices,
    } = gameGraphDataWorld(g, dataProvider, wasmApi, {
        dataCamera: dataCamera,
    });

    const renderTargetWorld = renderPassWorld(g, wasmApi, {
        dataDebug: dataDebug,
        camera: camera,
        cameraData: dataCamera,
        wasmWaterEdgeInstances: wasmWaterEdgeInstances,
        warmTileLandInstances: warmTileLandInstances,
        wasmTileFogOfWarInstances: wasmTileFogOfWarInstances,
        wasmTileWaterInstances: wasmTileWaterInstances,
        wasmMapDetailVertices: wasmMapDetailVertices,
        wasmRouteVertices: wasmRouteVertices,
    });

    const { drawWorldPostProcess } = renderWorldPostProcess(g, {
        dataDebug: dataDebug,
        camera: camera,
        dataPointerHexPosition: dataPointerHexPosition,
        world: renderTargetWorld,
    })

    const { drawTileHighlightsFront, drawTileHighlightsBack } = renderTileHighlight(g, dataProvider, {
        dataDebug: dataDebug,
        camera: camera,
        dataPointerHexPosition: dataPointerHexPosition,
    })

    const {
        drawOverlayFill,
        drawOverlayBorderBack,
        drawOverlayBorderFront,
        drawRouteHighlight,
    } = renderOverlay(g, dataProvider, wasmApi, {
        dataDebug: dataDebug,
        camera: camera,
        visibleChunks: wasmVisibleChunks
    })

    const { drawTileGrid} = renderTileGrid(g, wasmApi, {
        camera: camera,
        dataDebug: dataDebug,
        dataPointerWorldPosition: dataPointerWorldPosition,
        dataPointerHexPosition: dataPointerHexPosition,
    })

    const renderTargetWorldCombined = g.rendertarget({
        size: g.canvasSize(),
        sizeScale: g.dataConst(1),
        attachments: {
            color: {
                type: "color",
                format: GLColorStoreFormat.RGBA_16F,
            },
            depth: {
                type: "ref",
                source: renderTargetWorld,
                sourceAttachmentName: "depth",
            },
        },
        renderPasses: [
            drawWorldPostProcess,

            drawOverlayFill,
            drawOverlayBorderBack,
            drawOverlayBorderFront,

            drawRouteHighlight,

            drawTileGrid,
            drawTileHighlightsFront,
            drawTileHighlightsBack,
        ],
        clearColor: [0, 0, 0, 0],
    });

    const drawDebugVis = debugVisRendertarget(g, renderTargetWorldCombined);

    g.canvas({
        renderPasses: [drawDebugVis],
        clearColor: [0, 0, 0, 1],
    });

    const {htmlDraw} = gameGraphHtml(g, dataProvider, {
        dataCamera: dataCamera,
    });

    g.htmlContainer({
        elementId: "game-overlay",
        renderPasses: [htmlDraw],
    });

    return g.getNodes();
}

