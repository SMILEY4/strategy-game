import type {RenderGraphBuilder} from "@modules/rendergraph/render-graph-builder.ts";
import type {RenderWasmApi} from "@pages/game/renderer/wasm/render-wasm-api.ts";
import type {DataRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.data.ts";
import type {VersionedContainer} from "@pages/game/renderer/data/versioned-data.ts";
import type {DebugData} from "@app/features/game/database/debug.database.ts";
import type {CameraRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.camera.ts";
import type {WasmDataRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.wasm-data.ts";
import type {Camera} from "@app/features/game/models/camera.ts";
import type {RendertargetRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.rendertarget.ts";
import {renderPassWorld} from "@pages/game/renderer/graph/world/render-pass.world.ts";
import {renderPassWorldPostProcess} from "@pages/game/renderer/graph/world/render-pass.world-post-process.ts";

export function graphWorld(
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

    const world = renderPassWorld(g, wasmApi, inputs);

    return renderPassWorldPostProcess(g, {
        world: world,
    });
}