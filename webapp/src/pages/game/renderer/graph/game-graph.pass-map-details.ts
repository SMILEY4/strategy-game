import type {RenderGraphBuilder} from "@modules/rendergraph/render-graph-builder.ts";
import {GlAttributeType} from "@modules/rendergraph/webgl/gl-program.ts";
import type {GameGraphWasmApi} from "@pages/game/renderer/game-graph.wasm-api.ts";
import SHADER_MAP_DETAILS_VERT from "./../shader/mapDetails.vsh";
import SHADER_MAP_DETAILS_FRAG from "./../shader/mapDetails.fsh";
import type {WasmDataRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.wasm-data.ts";
import type {CameraRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.camera.ts";
import type {DataRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.data.ts";
import type {DebugData} from "@app/features/game/database/debug.database.ts";
import {GLColorStoreFormat, GLDepthStoreFormat} from "@modules/rendergraph/webgl/gl-framebuffer.ts";
import type {RenderCamera} from "@pages/game/renderer/data/models.ts";


export function gameGraphPassMapDetails(
    g: RenderGraphBuilder,
    wasmApi: GameGraphWasmApi,
    inputs: {
        wasmMapDetailVertices: WasmDataRenderGraphNode,
        cameraData: DataRenderGraphNode<RenderCamera>,
        camera: CameraRenderGraphNode,
        dataDebug: DataRenderGraphNode<DebugData & { revId: string }>
    },
) {

    const geometry = g.geometry({
        sources: [
            g.wasmGeometrySource({
                source: inputs.wasmMapDetailVertices,
                download: () => wasmApi.downloadMapDetailVertices(),
                content: "vertices",
                layout: [
                    {
                        name: "tilePosition",
                        type: GlAttributeType.FLOAT,
                        amountComponents: 2,
                    },
                    {
                        name: "vertexPosition",
                        type: GlAttributeType.FLOAT,
                        amountComponents: 3,
                    },
                    {
                        name: "offset",
                        type: GlAttributeType.FLOAT,
                        amountComponents: 2,
                    },
                    {
                        name: "textureCoordinates",
                        type: GlAttributeType.FLOAT,
                        amountComponents: 2,
                    },
                    {
                        name: "color",
                        type: GlAttributeType.FLOAT,
                        amountComponents: 3,
                    },

                ],
            }),
        ],
    });


    const textureSpritesColor = g.texture({
        url: "/sprites/mountains.color.png",
    });

    const textureSpritesOutline = g.texture({
        url: "/sprites/mountains.outline.png",
    });

    const dataDebugMsaaFactor = g.dataTransformer(
        g.transform({
            inputs: [inputs.dataDebug],
            func: (data) => data.renderer.mapDetails.msaa
        })
    )

    const cameraDirection = g.dataTransformer(
        g.transform({
            inputs: [inputs.cameraData],
            func: (data) => {
                return data.direction
            }
        })
    )

    const shader = g.shader({
        srcVertex: SHADER_MAP_DETAILS_VERT,
        srcFragment: SHADER_MAP_DETAILS_FRAG,
        prefixUniforms: "u_",
        prefixVertexAttributes: "in_",
    });

    const draw = g.draw({
        shader: shader,
        geometry: geometry,
        inputs: {
            "cameraDirection": cameraDirection as DataRenderGraphNode<unknown>,
            "camera": inputs.camera,
            "spritesColor": textureSpritesColor,
            "spritesOutline": textureSpritesOutline,
        },
    });

    const canvasSize = g.canvasSize();

    const rendertarget = g.rendertarget({
        size: canvasSize,
        sizeScale: dataDebugMsaaFactor,
        renderPasses: [draw],
        attachments: {
            color: {
                type: "color",
                format: GLColorStoreFormat.RGBA_8,
            },
            depth: {
                type: "depth",
                format: GLDepthStoreFormat.DEPTH_COMPONENT24,
            },
        },
        depthTesting: true,
        clearColor: [0, 0, 0, 0],
    });

    return {layerMapDetails: rendertarget};
}