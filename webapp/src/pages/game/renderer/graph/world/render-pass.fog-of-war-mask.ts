import type {RenderGraphBuilder} from "@modules/rendergraph/render-graph-builder.ts";
import type {RendertargetRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.rendertarget.ts";
import type {RenderWasmApi} from "@pages/game/renderer/wasm/render-wasm-api.ts";
import {GlAttributeType} from "@modules/rendergraph/webgl/gl-program.ts";
import {createUnitHexagonMesh} from "@modules/utilities/hex-geometry.ts";
import type {DataRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.data.ts";
import type {VersionedContainer} from "@pages/game/renderer/data/versioned-data.ts";
import type {DeveloperSettings} from "@app/features/game/database/developer-settings.database.ts";
import type {CameraRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.camera.ts";
import type {WasmDataRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.wasm-data.ts";
import SHADER_FOG_OF_WAR_MASK_VERT from "@pages/game/renderer/shader/fogofwar/fogOfWarMask.vsh";
import SHADER_FOG_OF_WAR_MASK_FRAG from "@pages/game/renderer/shader/fogofwar/fogOfWarMask.fsh";
import {DepthFunc} from "@modules/rendergraph/nodes/rg-node.draw.ts";
import {GLColorStoreFormat, GLDepthStoreFormat} from "@modules/rendergraph/webgl/gl-texture-attachment.ts";

export function renderPassFogOfWar(
    g: RenderGraphBuilder,
    wasmApi: RenderWasmApi,
    inputs: {
        dataDeveloperSettings: DataRenderGraphNode<VersionedContainer<DeveloperSettings>>,
        camera: CameraRenderGraphNode,
        wasmTileFogOfWarInstances: WasmDataRenderGraphNode,
    },
): RendertargetRenderGraphNode<"color"> {

    const mesh = g.transformVertexOut({
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
                source: mesh,
                output: "mesh",
            }),
            g.wasmGeometrySource({
                source: inputs.wasmTileFogOfWarInstances,
                download: () => wasmApi.download.getTileFogOfWarInstances(),
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

    const textureTerrainSplat = g.texture({
        url: "/sprites/base_terrain_shape.png",
    });

    const shader = g.shader({
        srcVertex: SHADER_FOG_OF_WAR_MASK_VERT,
        srcFragment: SHADER_FOG_OF_WAR_MASK_FRAG,
        prefixUniforms: "u_",
        prefixVertexAttributes: "in_",
    });

    const drawFogOfWarTiles = g.draw({
        shader: shader,
        geometry: geometry,
        inputs: {
            "camera": inputs.camera,
            "terrainSplat": textureTerrainSplat,
            "tileScale": g.dataTransformer(
                g.transform({
                    inputs: [inputs.dataDeveloperSettings],
                     func: (data) => data.data.renderer.fogOfWar.tileScale,
                }),
            ) as DataRenderGraphNode<unknown>,
            "hexOffsetScale": g.dataTransformer(
                g.transform({
                    inputs: [inputs.dataDeveloperSettings],
                     func: (data) => data.data.renderer.geometry.hexOffsetScale,
                }),
            ) as DataRenderGraphNode<unknown>,
        },
        blend: gl => {
            gl.blendFuncSeparate(
                gl.SRC_ALPHA,
                gl.ONE,
                gl.ONE,
                gl.ONE_MINUS_SRC_ALPHA,
            );
        },
        writeDepth: true,
        testDepth: DepthFunc.ALWAYS,
    });

    return g.rendertarget({
        size: g.canvasSize(),
        sizeScale: g.dataConst(1),
        renderPasses: [drawFogOfWarTiles],
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
        clearColor: [1, 0, 0, 1],
    });
}
