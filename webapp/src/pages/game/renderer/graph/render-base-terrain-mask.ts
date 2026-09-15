import type {RenderGraphBuilder} from "@modules/rendergraph/render-graph-builder.ts";
import type {DataRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.data.ts";
import type {DebugData} from "@app/features/game/database/debug.database.ts";
import type {VersionedContainer} from "@pages/game/renderer/data/versioned-data.ts";
import {GlAttributeType} from "@modules/rendergraph/webgl/gl-program.ts";
import {vec2} from "gl-matrix";
import type {CameraRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.camera.ts";
import type {RenderWasmApi} from "@pages/game/renderer/wasm/render-wasm-api.ts";
import type {WasmDataRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.wasm-data.ts";
import {createUnitHexagonMesh} from "@modules/utilities/hex-geometry.ts";
import {GLColorStoreFormat} from "@modules/rendergraph/webgl/gl-framebuffer.ts";
import type {RendertargetRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.rendertarget.ts";
import SHADER_MASK_LAND_VERT from "@pages/game/renderer/shader/baseTerrainMask/land.vsh";
import SHADER_MASK_LAND_FRAG from "@pages/game/renderer/shader/baseTerrainMask/land.fsh";
import SHADER_MASK_WATEREDGE_VERT from "@pages/game/renderer/shader/baseTerrainMask/wateredge.vsh";
import SHADER_MASK_WATEREDGE_FRAG from "@pages/game/renderer/shader/baseTerrainMask/wateredge.fsh";

export function renderBaseTerrainMask(
    g: RenderGraphBuilder,
    wasmApi: RenderWasmApi,
    inputs: {
        dataDebug: DataRenderGraphNode<VersionedContainer<DebugData>>,
        camera: CameraRenderGraphNode,
        wasmWaterEdgeInstances: WasmDataRenderGraphNode,
        warmTileLandInstances: WasmDataRenderGraphNode,
    },
): RendertargetRenderGraphNode<"color"> {

    //======================  TILES =========================================

    const landTileMeshTransformer = g.transformVertexOut({
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

    const landTilesGeometry = g.geometry({
        sources: [
            g.geometrySource({
                source: landTileMeshTransformer,
                output: "mesh",
            }),
            g.wasmGeometrySource({
                source: inputs.warmTileLandInstances,
                download: () => wasmApi.download.getTileLandInstances(),
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

    const shaderLandTiles = g.shader({
        srcVertex: SHADER_MASK_LAND_VERT,
        srcFragment: SHADER_MASK_LAND_FRAG,
        prefixUniforms: "u_",
        prefixVertexAttributes: "in_",
    });

    const drawLandTiles = g.draw({
        shader: shaderLandTiles,
        geometry: landTilesGeometry,
        inputs: {
            "camera": inputs.camera,
            "dbg_hexOffsetScale": g.dataTransformer(
                g.transform({
                    inputs: [inputs.dataDebug],
                    func: (data) => data.data.renderer.randomHexOffsetScale,
                }),
            ) as DataRenderGraphNode<unknown>,
        },
    });

    //======================  EDGES =========================================

    const waterEdgeMeshTransformer = g.transformVertexOut({
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
                        name: "corner",
                        type: GlAttributeType.FLOAT,
                        amountComponents: 3,
                    },
                    {
                        name: "vertexPositionA",
                        type: GlAttributeType.FLOAT,
                        amountComponents: 3,
                    },
                    {
                        name: "vertexPositionB",
                        type: GlAttributeType.FLOAT,
                        amountComponents: 3,
                    },
                ],
            },
        },
        func: () => {
            return {
                "mesh": {
                    data: createUnitHexagonSlice(),
                    count: 3,
                },
            };
        },
    });

    const waterEdgesGeometry = g.geometry({
        sources: [
            g.geometrySource({
                source: waterEdgeMeshTransformer,
                output: "mesh",
            }),
            g.wasmGeometrySource({
                source: inputs.wasmWaterEdgeInstances,
                download: () => wasmApi.download.getWaterEdgeInstances(),
                content: "instances",
                layout: [
                    {
                        name: "tilePosition",
                        type: GlAttributeType.FLOAT,
                        amountComponents: 2,
                    },
                    {
                        name: "direction",
                        type: GlAttributeType.U_INT,
                        amountComponents: 1,
                    },
                    {
                        name: "landDirection",
                        type: GlAttributeType.FLOAT,
                        amountComponents: 3,
                    },
                    {
                        name: "extendedLand",
                        type: GlAttributeType.FLOAT,
                        amountComponents: 2,
                    },
                ],
            }),
        ],
    });

    const shaderWaterEdges = g.shader({
        srcVertex: SHADER_MASK_WATEREDGE_VERT,
        srcFragment: SHADER_MASK_WATEREDGE_FRAG,
        prefixUniforms: "u_",
        prefixVertexAttributes: "in_",
    });

    const drawWaterEdges = g.draw({
        shader: shaderWaterEdges,
        geometry: waterEdgesGeometry,
        inputs: {
            "camera": inputs.camera,
            "dbg_hexOffsetScale": g.dataTransformer(
                g.transform({
                    inputs: [inputs.dataDebug],
                    func: (data) => data.data.renderer.randomHexOffsetScale,
                }),
            ) as DataRenderGraphNode<unknown>,
            "dbg_noise1Scale": g.dataTransformer(
                g.transform({
                    inputs: [inputs.dataDebug],
                    func: (data) => data.data.renderer.landMask.noise1Scale,
                }),
            ) as DataRenderGraphNode<unknown>,
            "dbg_noise1Amplitude": g.dataTransformer(
                g.transform({
                    inputs: [inputs.dataDebug],
                    func: (data) => data.data.renderer.landMask.noise1Amplitude,
                }),
            ) as DataRenderGraphNode<unknown>,
            "dbg_noise2Scale": g.dataTransformer(
                g.transform({
                    inputs: [inputs.dataDebug],
                    func: (data) => data.data.renderer.landMask.noise2Scale,
                }),
            ) as DataRenderGraphNode<unknown>,
            "dbg_noise2Amplitude": g.dataTransformer(
                g.transform({
                    inputs: [inputs.dataDebug],
                    func: (data) => data.data.renderer.landMask.noise2Amplitude,
                }),
            ) as DataRenderGraphNode<unknown>,
        },
    });

    //======================  OUTPUT ========================================

    const canvasSize = g.canvasSize();

    return g.rendertarget({
        size: canvasSize,
        sizeScale: g.dataConst(1),
        renderPasses: [drawLandTiles, drawWaterEdges],
        attachments: {
            color: {
                type: "color",
                format: GLColorStoreFormat.RGBA_8,
            },
        },
        clearColor: [1, 1, 1, 1],
    });
}

function createUnitHexagonSlice(): ArrayBuffer {
    const buffer = new ArrayBuffer(3 * 12 * Float32Array.BYTES_PER_ELEMENT);
    const view = new DataView(buffer);
    let viewCounter = 0;

    function pushFloat32(value: number): void {
        view.setFloat32(viewCounter, value, true);
        viewCounter += Float32Array.BYTES_PER_ELEMENT;
    }

    function pushPosition(x: number, z: number): void {
        pushFloat32(x);
        pushFloat32(0);
        pushFloat32(z);
    }

    function pushCorner(a: number, b: number, c: number): void {
        pushFloat32(a);
        pushFloat32(b);
        pushFloat32(c);
    }

    const center = vec2.fromValues(0, 0);

    const pointerA = vec2.fromValues(0, 1);
    const pointerB = vec2.fromValues(0, 1);
    vec2.rotate(pointerB, pointerB, center, deg2rad(60));

    // center
    pushPosition(0, 0);
    pushCorner(0, 0, 1);
    pushPosition(pointerA[0], pointerA[1]);
    pushPosition(pointerB[0], pointerB[1]);

    // vertex a
    pushPosition(pointerA[0], pointerA[1]);
    pushCorner(1, 0, 0);
    pushPosition(pointerA[0], pointerA[1]);
    pushPosition(pointerB[0], pointerB[1]);

    // vertex b
    pushPosition(pointerB[0], pointerB[1]);
    pushCorner(0, 1, 0);
    pushPosition(pointerA[0], pointerA[1]);
    pushPosition(pointerB[0], pointerB[1]);

    return buffer;
}

function deg2rad(degrees: number): number {
    return degrees * (Math.PI / 180);
}
