import type {RenderGraphBuilder} from "@modules/rendergraph/render-graph-builder.ts";
import {GlAttributeType} from "@modules/rendergraph/webgl/gl-program.ts";
import type {GameGraphWasmApi} from "@pages/game/renderer/game-graph.wasm-api.ts";
import SHADER_TILEMAP_VERT from "./../shader/tilemap.vsh";
import SHADER_TILEMAP_FRAG from "./../shader/tilemap.fsh";
import type {WasmDataRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.wasm-data.ts";
import type {CameraRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.camera.ts";
import type {DataRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.data.ts";
import type {DebugData} from "@app/features/game/database/debug.database.ts";
import {GLColorStoreFormat} from "@modules/rendergraph/webgl/gl-framebuffer.ts";
import {createUnitHexagonMesh} from "@modules/utilities/hex-geometry.ts";


export function gameGraphPassTerrain(
    g: RenderGraphBuilder,
    wasmApi: GameGraphWasmApi,
    inputs: {
        wasmTileInstances: WasmDataRenderGraphNode,
        camera: CameraRenderGraphNode
        dataDebug: DataRenderGraphNode<DebugData & { revId: string}>
    },
) {

    const meshTransformer = g.transformVertexOut({
        inputs: [],
        outputs: {
            mesh: {
                content: "vertices",
                layout: [
                    {
                        name: "vertexPosition",
                        type: GlAttributeType.FLOAT,
                        amountComponents: 3,
                    },
                    {
                        name: "textureCoordinates",
                        type: GlAttributeType.FLOAT,
                        amountComponents: 2,
                    },
                ],
            },
        },
        func: () => {
            return {
                "mesh": {
                    data: createUnitHexagonMesh(),
                    count: 6 * 3,
                },
            };
        },
    });

    const geometry = g.geometry({
        sources: [
            g.geometrySource({
                source: meshTransformer,
                output: "mesh",
            }),
            g.wasmGeometrySource({
                source: inputs.wasmTileInstances,
                download: () => wasmApi.downloadTileLandInstances(),
                content: "instances",
                layout: [
                    {
                        name: "tilePosition",
                        type: GlAttributeType.FLOAT,
                        amountComponents: 2,
                    },
                ],
            }),
        ],
    });


    const textureStamp = g.texture({
        url: "/sprites/base_terrain_shape.png",
    });

    const shader = g.shader({
        srcVertex: SHADER_TILEMAP_VERT,
        srcFragment: SHADER_TILEMAP_FRAG,
        prefixUniforms: "u_",
        prefixVertexAttributes: "in_",
    });

    const dataDebugHexOffsetScale = g.dataTransformer(
        g.transform({
            inputs: [inputs.dataDebug],
            func: (data) => data.renderer.randomHexOffsetScale
        })
    )

    const dataDebugScale = g.dataTransformer(
        g.transform({
            inputs: [inputs.dataDebug],
            func: (data) => data.renderer.baseTerrain.scale
        })
    )

    const draw = g.draw({
        shader: shader,
        geometry: geometry,
        inputs: {
            "camera": inputs.camera,
            "baseTerrain": textureStamp,
            "dbg_scale": dataDebugScale as DataRenderGraphNode<unknown>,
            "dbg_hexOffsetScale": dataDebugHexOffsetScale as DataRenderGraphNode<unknown>,
        },
    });

    const canvasSize = g.canvasSize();

    const rendertarget = g.rendertarget({
        size: canvasSize,
        renderPasses: [draw],
        attachments: {
            color: {
                type: "color",
                format: GLColorStoreFormat.RGBA_8,
            },
        },
        clearColor: [0, 0, 0, 0],
    });

    return {layerBaseTerrain: rendertarget};
}