import type {RenderGraphBuilder} from "@modules/rendergraph/render-graph-builder.ts";
import type {RenderWasmApi} from "@pages/game/renderer/wasm/render-wasm-api.ts";
import type {DataRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.data.ts";
import type {VersionedContainer} from "@pages/game/renderer/data/versioned-data.ts";
import type {DebugData} from "@app/features/game/database/debug.database.ts";
import type {CameraRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.camera.ts";
import type {WasmDataRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.wasm-data.ts";
import {GlAttributeType} from "@modules/rendergraph/webgl/gl-program.ts";
import {createUnitHexagonMesh} from "@modules/utilities/hex-geometry.ts";
import SHADER_FOG_OF_WAR_MASK_VERT from "@pages/game/renderer/shader/fogofwar/fogOfWarMask.vsh";
import SHADER_FOG_OF_WAR_MASK_FRAG from "@pages/game/renderer/shader/fogofwar/fogOfWarMask.fsh";
import SHADER_FOG_OF_WAR_OVERLAY_VERT from "@pages/game/renderer/shader/fogofwar/fogOfWarOverlay.vsh";
import SHADER_FOG_OF_WAR_OVERLAY_FRAG from "@pages/game/renderer/shader/fogofwar/fogOfWarOverlay.fsh";
import {GLColorStoreFormat, GLDepthStoreFormat} from "@modules/rendergraph/webgl/gl-framebuffer.ts";
import {DepthFunc} from "@modules/rendergraph/nodes/rg-node.draw.ts";
import {buildFullscreenQuad} from "@pages/game/renderer/graph/build-fullscreen-quad.ts";

export function renderFogOfWar(
    g: RenderGraphBuilder,
    wasmApi: RenderWasmApi,
    inputs: {
        dataDebug: DataRenderGraphNode<VersionedContainer<DebugData>>,
        camera: CameraRenderGraphNode,
        wasmTileFogOfWarInstances: WasmDataRenderGraphNode,
    },
) {

    //====================== FoW MASK =======================================

    const fogTileMeshTransformer = g.transformVertexOut({
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

    const fogOfWarTilesGeometry = g.geometry({
        sources: [
            g.geometrySource({
                source: fogTileMeshTransformer,
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

    const shaderFogOfWarTiles = g.shader({
        srcVertex: SHADER_FOG_OF_WAR_MASK_VERT,
        srcFragment: SHADER_FOG_OF_WAR_MASK_FRAG,
        prefixUniforms: "u_",
        prefixVertexAttributes: "in_",
    });

    const textureTerrainSplat = g.texture({
        url: "/sprites/base_terrain_shape.png",
    });

    const drawFogOfWarTiles = g.draw({
        shader: shaderFogOfWarTiles,
        geometry: fogOfWarTilesGeometry,
        inputs: {
            "camera": inputs.camera,
            "terrainSplat": textureTerrainSplat,
            "dbg_scale": g.dataTransformer(
                g.transform({
                    inputs: [inputs.dataDebug],
                    func: (data) => data.data.renderer.fogOfWar.scale,
                }),
            ) as DataRenderGraphNode<unknown>,
            "dbg_hexOffsetScale": g.dataTransformer(
                g.transform({
                    inputs: [inputs.dataDebug],
                    func: (data) => data.data.renderer.randomHexOffsetScale,
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

    const canvasSize = g.canvasSize();

    const fogOfWarMask =  g.rendertarget({
        size: canvasSize,
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

    //====================== FoW OVERLAY ====================================


    const fullscreenMeshTransformer = g.transformVertexOut({
        inputs: [],
        outputs: {
            mesh: {
                content: "vertices",
                layout: [
                    {
                        name: "vertexPosition",
                        type: GlAttributeType.FLOAT,
                        amountComponents: 2,
                    },
                ],
            },
        },
        func: () => {
            return {
                "mesh": buildFullscreenQuad()
            };
        },
    });

    const overlayGeometry = g.geometry({
        sources: [
            g.geometrySource({
                source: fullscreenMeshTransformer,
                output: "mesh",
            }),
        ],
    });

    const shaderOverlay = g.shader({
        srcVertex: SHADER_FOG_OF_WAR_OVERLAY_VERT,
        srcFragment: SHADER_FOG_OF_WAR_OVERLAY_FRAG,
        prefixUniforms: "u_",
        prefixVertexAttributes: "in_",
    });

    return g.draw({
        shader: shaderOverlay,
        geometry: overlayGeometry,
        inputs: {
            "mask": g.pickRendertargetAttachment({
                rendertarget: fogOfWarMask,
                attachment: "color",
            }),
        },
        writeDepth: false,
        testDepth: DepthFunc.ALWAYS,
    });
}