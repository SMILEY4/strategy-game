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

export function gameGraph(g: RenderGraphBuilder, dataProvider: GameRendererDataProvider, wasmApi: RenderWasmApi) {

    //======================  COMMON ========================================

    const dataDebug = g.dataExternal<VersionedContainer<DebugData>>(
        (prev) => prev?.revId !== dataProvider.getDebugData().revId,
        () => dataProvider.getDebugData().load(),
    );


    const {dataCamera, camera} = gameGraphDataCamera(g, dataProvider);

    const {
        warmTileLandInstances,
        wasmTileWaterInstances,
        wasmWaterEdgeInstances,
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

    //======================  BASE TERRAIN ==================================

    const {drawWaterTiles, drawLandTiles} = renderBaseTerrain(g, wasmApi, {
        dataDebug: dataDebug,
        camera: camera,
        warmTileLandInstances: warmTileLandInstances,
        wasmTileWaterInstances: wasmTileWaterInstances,
        renderTargetBaseTerrainMask: renderTargetBaseTerrainMask,
    });

    //======================  OUTPUT ========================================

    const canvasSize = g.canvasSize();

    const renderTargetComposite = g.rendertarget({
        size: canvasSize,
        renderPasses: [drawWaterTiles, drawLandTiles],
        depthTesting: false,
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
        depthTesting: false,
        clearColor: [0, 0, 0, 1],
    });

    return g.getNodes();
}

