import type {RenderGraphBuilder} from "@modules/rendergraph/render-graph-builder.ts";
import {GlAttributeType} from "@modules/rendergraph/webgl/gl-program.ts";
import type {RenderWasmApi} from "@pages/game/renderer/wasm/render-wasm-api.ts";
import SHADER_FOW_VERT from "./../shader/fogOfWar.vsh";
import SHADER_FOW_FRAG from "./../shader/fogOfWar.fsh";
import type {WasmDataRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.wasm-data.ts";
import type {CameraRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.camera.ts";
import type {DataRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.data.ts";
import type {DebugData} from "@app/features/game/database/debug.database.ts";
import {GLColorStoreFormat} from "@modules/rendergraph/webgl/gl-framebuffer.ts";
import {createUnitHexagonMesh} from "@modules/utilities/hex-geometry.ts";
import type {VersionedContainer} from "@pages/game/renderer/data/versioned-data.ts";


export function gameGraphPassFogOfWar(
    g: RenderGraphBuilder,
    wasmApi: RenderWasmApi,
    inputs: {
        wasmTileInstances: WasmDataRenderGraphNode,
        camera: CameraRenderGraphNode,
        dataDebug: DataRenderGraphNode<VersionedContainer<DebugData>>
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
                    data: createUnitHexagonMesh(true, false),
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
                download: () => wasmApi.download.downloadTileFogOfWarInstances(),
                content: "instances",
                layout: [
                    {
                        name: "tilePosition",
                        type: GlAttributeType.FLOAT,
                        amountComponents: 2,
                    },
                    {
                        name: "visibility",
                        type: GlAttributeType.U_BYTE,
                        amountComponents: 1,
                    },
                    {
                        name: "_padding",
                        type: GlAttributeType.PADDING,
                        amountComponents: 3,
                    },
                ],
            }),
        ],
    });

    const textureStamp = g.texture({
        url: "/sprites/base_terrain_shape.png",
    });

    const shader = g.shader({
        srcVertex: SHADER_FOW_VERT,
        srcFragment: SHADER_FOW_FRAG,
        prefixUniforms: "u_",
        prefixVertexAttributes: "in_",
    });

    const dataDebugHexOffsetScale = g.dataTransformer(
        g.transform({
            inputs: [inputs.dataDebug],
            func: (data) => data.data.renderer.randomHexOffsetScale,
        }),
    );

    const dataDebugScale = g.dataTransformer(
        g.transform({
            inputs: [inputs.dataDebug],
            func: (data) => data.data.renderer.fogOfWar.scale,
        }),
    );

    const draw = g.draw({
        shader: shader,
        geometry: geometry,
        inputs: {
            "camera": inputs.camera,
            "baseTerrain": textureStamp,
            "dbg_scale": dataDebugScale as DataRenderGraphNode<unknown>,
            "dbg_hexOffsetScale": dataDebugHexOffsetScale as DataRenderGraphNode<unknown>,
        },
        blend: gl => {
            gl.blendFuncSeparate(
                gl.SRC_ALPHA,
                gl.ONE,
                gl.ONE,
                gl.ONE_MINUS_SRC_ALPHA,
            );
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
        clearColor: [1, 0, 0, 1],
    });

    return {layerFogOfWar: rendertarget};
}