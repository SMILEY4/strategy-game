import type {RenderGraphBuilder} from "@modules/rendergraph/render-graph-builder.ts";
import type {RenderWasmApi} from "@pages/game/renderer/wasm/render-wasm-api.ts";
import type {DataRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.data.ts";
import type {VersionedContainer} from "@pages/game/renderer/data/versioned-data.ts";
import type {DebugData} from "@app/features/game/database/debug.database.ts";
import type {CameraRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.camera.ts";
import type {WasmDataRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.wasm-data.ts";
import {GlAttributeType} from "@modules/rendergraph/webgl/gl-program.ts";
import SHADER_ROUTES_VERT from "@pages/game/renderer/shader/routes/routes.vsh";
import SHADER_ROUTES_FRAG from "@pages/game/renderer/shader/routes/routes.fsh";
import {DepthFunc} from "@modules/rendergraph/nodes/rg-node.draw.ts";

export function renderRoutes(
    g: RenderGraphBuilder,
    wasmApi: RenderWasmApi,
    inputs: {
        dataDebug: DataRenderGraphNode<VersionedContainer<DebugData>>,
        camera: CameraRenderGraphNode,
        wasmRouteVertices: WasmDataRenderGraphNode,
    },
) {

    const geometry = g.geometry({
        sources: [
            g.wasmGeometrySource({
                source: inputs.wasmRouteVertices,
                download: () => wasmApi.download.getRouteVertices(),
                content: "vertices",
                layout: [
                    {
                        name: "vertexPosition",
                        type: GlAttributeType.FLOAT,
                        amountComponents: 2,
                    },
                    {
                        name: "textureCoordinates",
                        type: GlAttributeType.FLOAT,
                        amountComponents: 2,
                    },
                    {
                        name: "pathLength",
                        type: GlAttributeType.FLOAT,
                        amountComponents: 1,
                    },
                ],
            }),
        ],
    });

    const shader = g.shader({
        srcVertex: SHADER_ROUTES_VERT,
        srcFragment: SHADER_ROUTES_FRAG,
        prefixUniforms: "u_",
        prefixVertexAttributes: "in_",
    });

    const draw = g.draw({
        shader: shader,
        geometry: geometry,
        inputs: {
            "camera": inputs.camera,
        },
        writeDepth: false,
        testDepth: DepthFunc.ALWAYS,
    });

    return {
        drawRoutes: draw
    }
}
