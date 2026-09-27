import type {RenderGraphBuilder} from "@modules/rendergraph/render-graph-builder.ts";
import type {RenderWasmApi} from "@pages/game/renderer/wasm/render-wasm-api.ts";
import type {DataRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.data.ts";
import type {VersionedContainer} from "@pages/game/renderer/data/versioned-data.ts";
import type {DebugData} from "@app/features/game/database/debug.database.ts";
import type {CameraRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.camera.ts";
import type {WasmDataRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.wasm-data.ts";
import {renderPassTerrainMask} from "@pages/game/renderer/graph/world/render-pass.terrain-mask.ts";
import {renderPassFogOfWar} from "@pages/game/renderer/graph/world/render-pass.fog-of-war-mask.ts";
import {renderTerrain} from "@pages/game/renderer/graph/world/render.terrain.ts";
import type {Camera} from "@app/features/game/models/camera.ts";
import {renderMapDetails} from "@pages/game/renderer/graph/world/render.map-details.ts";
import {renderRoutes} from "@pages/game/renderer/graph/world/render.routes.ts";
import {renderFogOfWar} from "@pages/game/renderer/graph/world/render.fog-of-war.ts";
import type {RendertargetRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.rendertarget.ts";
import {GLColorStoreFormat, GLDepthStoreFormat} from "@modules/rendergraph/webgl/gl-texture-attachment.ts";

export function renderPassWorld(
    g: RenderGraphBuilder,
    wasmApi: RenderWasmApi,
    inputs: {
        dataDebug: DataRenderGraphNode<VersionedContainer<DebugData>>,
        camera: CameraRenderGraphNode,
        cameraData: DataRenderGraphNode<VersionedContainer<Camera>>,
        wasmWaterEdgeInstances: WasmDataRenderGraphNode,
        warmTileLandInstances: WasmDataRenderGraphNode,
        wasmTileFogOfWarInstances: WasmDataRenderGraphNode,
        wasmTileWaterInstances: WasmDataRenderGraphNode,
        wasmMapDetailVertices: WasmDataRenderGraphNode,
        wasmRouteVertices: WasmDataRenderGraphNode,
    },
): RendertargetRenderGraphNode<"color" | "depth"> {

    const terrainMask = renderPassTerrainMask(g, wasmApi, {
        dataDebug: inputs.dataDebug,
        camera: inputs.camera,
        wasmWaterEdgeInstances: inputs.wasmWaterEdgeInstances,
        warmTileLandInstances: inputs.warmTileLandInstances,
    });

    const fogOfWarMask = renderPassFogOfWar(g, wasmApi, {
        dataDebug: inputs.dataDebug,
        camera: inputs.camera,
        wasmTileFogOfWarInstances: inputs.wasmTileFogOfWarInstances,
    });

    const {drawTerrainWater, drawTerrainLand} = renderTerrain(g, wasmApi, {
        dataDebug: inputs.dataDebug,
        camera: inputs.camera,
        warmTileLandInstances: inputs.warmTileLandInstances,
        wasmTileWaterInstances: inputs.wasmTileWaterInstances,
        renderTargetBaseTerrainMask: terrainMask,
    });

    const {drawMapDetails} = renderMapDetails(g, wasmApi, {
        dataDebug: inputs.dataDebug,
        camera: inputs.camera,
        cameraData: inputs.cameraData,
        wasmMapDetailVertices: inputs.wasmMapDetailVertices,
    });

    const {drawRoutes} = renderRoutes(g, wasmApi, {
        dataDebug: inputs.dataDebug,
        camera: inputs.camera,
        wasmRouteVertices: inputs.wasmRouteVertices,
        renderTargetBaseTerrainMask: terrainMask,
    });

    const {drawFogOfWarLayer1, drawFogOfWarLayer2} = renderFogOfWar(g, {
        camera: inputs.camera,
        cameraData: inputs.cameraData,
        fogOfWarMask: fogOfWarMask,
    });

    return g.rendertarget({
        size: g.canvasSize(),
        sizeScale: g.dataConst(1),
        renderPasses: [
            drawTerrainWater,
            drawTerrainLand,
            drawRoutes,
            drawMapDetails,
            drawFogOfWarLayer1,
            drawFogOfWarLayer2,
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
}