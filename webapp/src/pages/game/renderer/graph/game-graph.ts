import type {GameRendererDataProvider} from "@pages/game/renderer/data/game-renderer-data-provider.ts";
import type {RenderGraphBuilder} from "@modules/rendergraph/render-graph-builder.ts";
import type {RenderWasmApi} from "@pages/game/renderer/wasm/render-wasm-api.ts";
import {gameGraphDataCamera} from "@pages/game/renderer/graph/camera-data.ts";
import {gameGraphDataWorld} from "@pages/game/renderer/graph/world-data.ts";
import {debugVisRendertarget} from "@pages/game/renderer/graph/debug-rendertarget.ts";
import {GlAttributeType} from "@modules/rendergraph/webgl/gl-program.ts";
import {createUnitHexagonMesh} from "@modules/utilities/hex-geometry.ts";
import {GLColorStoreFormat} from "@modules/rendergraph/webgl/gl-framebuffer.ts";
import type {DataRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.data.ts";
import type {VersionedContainer} from "@pages/game/renderer/data/versioned-data.ts";
import type {DebugData} from "@app/features/game/database/debug.database.ts";

import SHADER_MASK_LAND_VERT from "./../shader/maskland/land.vsh";
import SHADER_MASK_LAND_FRAG from "./../shader/maskland/land.fsh";
import SHADER_MASK_WATEREDGE_VERT from "./../shader/maskland/wateredge.vsh";
import SHADER_MASK_WATEREDGE_FRAG from "./../shader/maskland/wateredge.fsh";
import {vec2} from "gl-matrix";

export function gameGraph(g: RenderGraphBuilder, dataProvider: GameRendererDataProvider, wasmApi: RenderWasmApi) {

    const dataDebug = g.dataExternal<VersionedContainer<DebugData>>(
        (prev) => prev?.revId !== dataProvider.getDebugData().revId,
        () => dataProvider.getDebugData().load(),
    );

    const dataDebugHexOffsetScale = g.dataTransformer(
        g.transform({
            inputs: [dataDebug],
            func: (data) => data.data.renderer.randomHexOffsetScale,
        }),
    );

    const canvasSize = g.canvasSize();

    const {dataCamera, camera} = gameGraphDataCamera(g, dataProvider);

    const {
        wasmTileTerrainInstances,
        wasmWaterEdgeInstances,
    } = gameGraphDataWorld(g, dataProvider, wasmApi, {
        dataCamera: dataCamera,
    });

    //======================  TILES =========================================

    const tileMeshTransformer = g.transformVertexOut({
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

    const tilesGeometry = g.geometry({
        sources: [
            g.geometrySource({
                source: tileMeshTransformer,
                output: "mesh",
            }),
            g.wasmGeometrySource({
                source: wasmTileTerrainInstances,
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

    const shaderLandMask = g.shader({
        srcVertex: SHADER_MASK_LAND_VERT,
        srcFragment: SHADER_MASK_LAND_FRAG,
        prefixUniforms: "u_",
        prefixVertexAttributes: "in_",
    });

    const drawTileMask = g.draw({
        shader: shaderLandMask,
        geometry: tilesGeometry,
        inputs: {
            "camera": camera,
            "dbg_hexOffsetScale": dataDebugHexOffsetScale as DataRenderGraphNode<unknown>,
        },
    });

    //======================  EDGES =========================================

    const edgeMeshTransformer = g.transformVertexOut({
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

    const edgesGeometry = g.geometry({
        sources: [
            g.geometrySource({
                source: edgeMeshTransformer,
                output: "mesh",
            }),
            g.wasmGeometrySource({
                source: wasmWaterEdgeInstances,
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

    const shaderEdgeMask = g.shader({
        srcVertex: SHADER_MASK_WATEREDGE_VERT,
        srcFragment: SHADER_MASK_WATEREDGE_FRAG,
        prefixUniforms: "u_",
        prefixVertexAttributes: "in_",
    });

    const drawEdgeMask = g.draw({
        shader: shaderEdgeMask,
        geometry: edgesGeometry,
        inputs: {
            "camera": camera,
            "dbg_hexOffsetScale": dataDebugHexOffsetScale as DataRenderGraphNode<unknown>,
        },
    });

    //======================  OUTPUT ========================================

    const rendertargetTileMask = g.rendertarget({
        size: canvasSize,
        sizeScale: g.dataConst(1),
        renderPasses: [drawTileMask, drawEdgeMask],
        attachments: {
            color: {
                type: "color",
                format: GLColorStoreFormat.RGBA_8,
            },
        },
        clearColor: [0, 0, 0, 1],
    });

    const drawDebugVis = debugVisRendertarget(g, rendertargetTileMask);

    g.canvas({
        renderPasses: [drawDebugVis],
        depthTesting: false,
        clearColor: [0, 0, 0, 1],
    });

    return g.getNodes();
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
