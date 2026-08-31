import type {RenderGraphBuilder} from "@modules/rendergraph/render-graph-builder.ts";
import type {GameGraphWasmApi} from "@pages/game/renderer/game-graph.wasm-api.ts";
import type {CameraRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.camera.ts";
import type {DataRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.data.ts";
import type {DebugData} from "@app/features/game/database/debug.database.ts";
import type {MapMode} from "@app/features/game/models/map-mode.ts";
import type {GameRendererDataProvider} from "@pages/game/renderer/data/game-renderer-data-provider.ts";
import type {Entity} from "@app/features/game/models/entity.ts";
import type {WasmDataRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.wasm-data.ts";
import {GlAttributeType} from "@modules/rendergraph/webgl/gl-program.ts";
import {createUnitHexagonMesh} from "@modules/utilities/hex-geometry.ts";
import {GLColorStoreFormat} from "@modules/rendergraph/webgl/gl-framebuffer.ts";
import {vec2} from "gl-matrix";

import SHADER_FILL_VERT from "./../shader/overlayFill.vsh";
import SHADER_FILL_FRAG from "./../shader/overlayFill.fsh";
import SHADER_EDGE_VERT from "./../shader/overlayEdge.vsh";
import SHADER_EDGE_FRAG from "./../shader/overlayEdge.fsh";

export function gameGraphPassOverlay(
    g: RenderGraphBuilder,
    dataProvider: GameRendererDataProvider,
    wasmApi: GameGraphWasmApi,
    inputs: {
        visibleChunks: WasmDataRenderGraphNode,
        camera: CameraRenderGraphNode,
        dataDebug: DataRenderGraphNode<DebugData & { revId: string }>
    },
) {

    const dataMapMode = g.dataExternal<MapMode>(() => dataProvider.getMapMode(), (prev => {
        return prev.id !== dataProvider.getMapMode().id;
    }));


    const dataSelectedEntity = g.dataExternal<Entity | null>(() => dataProvider.getSelectedEntity(), (prev => {
        return prev?.id !== dataProvider.getSelectedEntity()?.id;
    }));

    const wasmMapMode = g.wasmData({
        source: {
            type: "js",
            data: dataMapMode,
            upload: (mode: MapMode) => wasmApi.setMapMode(mode),
        },
    });

    const wasmSelectedEntity = g.wasmData({
        source: {
            type: "js",
            data: dataSelectedEntity,
            upload: (entity: Entity | null) => wasmApi.setSelectedEntityId(entity),
        },
    });

    const buildOverlayInstances = g.wasmOperation({
        wasmInputs: [inputs.visibleChunks, wasmMapMode, wasmSelectedEntity],
        dataInputs: [],
        outputs: ["overlayFillInstances", "overlayEdgeInstances"],
        func: () => wasmApi.buildOverlayInstances(),
    });


    const wasmOverlayFillInstances = g.wasmData({
        source: {
            type: "wasm",
            operation: buildOverlayInstances,
            key: "overlayFillInstances",
        },
    });

    const meshTransformerFill = g.transformVertexOut({
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
                ],
            },
        },
        func: () => {
            return {
                "mesh": {
                    data: createUnitHexagonMesh(false, false),
                    count: 6 * 3,
                },
            };
        },
    });

    const geometryFill = g.geometry({
        sources: [
            g.geometrySource({
                source: meshTransformerFill,
                output: "mesh",
            }),
            g.wasmGeometrySource({
                source: wasmOverlayFillInstances,
                download: () => wasmApi.downloadOverlayFillInstances(),
                content: "instances",
                layout: [
                    {
                        name: "tilePosition",
                        type: GlAttributeType.FLOAT,
                        amountComponents: 2,
                    },
                    {
                        name: "color",
                        type: GlAttributeType.FLOAT,
                        amountComponents: 4,
                    },
                    {
                        name: "style",
                        type: GlAttributeType.U_INT,
                        amountComponents: 1,
                    },
                ],
            }),
        ],
    });

    const shaderFill = g.shader({
        srcVertex: SHADER_FILL_VERT,
        srcFragment: SHADER_FILL_FRAG,
        prefixUniforms: "u_",
        prefixVertexAttributes: "in_",
    });

    const drawFill = g.draw({
        shader: shaderFill,
        geometry: geometryFill,
        inputs: {
            "camera": inputs.camera,
        },
    });


    const wasmOverlayEdgeInstances = g.wasmData({
        source: {
            type: "wasm",
            operation: buildOverlayInstances,
            key: "overlayEdgeInstances",
        },
    });

    const meshTransformerEdge = g.transformVertexOut({
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

    const geometryEdge = g.geometry({
        sources: [
            g.geometrySource({
                source: meshTransformerEdge,
                output: "mesh",
            }),
            g.wasmGeometrySource({
                source: wasmOverlayEdgeInstances,
                download: () => wasmApi.downloadOverlayEdgeInstances(),
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
                        name: "color",
                        type: GlAttributeType.FLOAT,
                        amountComponents: 4,
                    },
                    {
                        name: "style",
                        type: GlAttributeType.U_INT,
                        amountComponents: 1,
                    },
                ],
            }),
        ],
    });

    const shaderEdge = g.shader({
        srcVertex: SHADER_EDGE_VERT,
        srcFragment: SHADER_EDGE_FRAG,
        prefixUniforms: "u_",
        prefixVertexAttributes: "in_",
    });

    const drawEdge = g.draw({
        shader: shaderEdge,
        geometry: geometryEdge,
        inputs: {
            "camera": inputs.camera,
        },
    });


    const canvasSize = g.canvasSize();

    const rendertarget = g.rendertarget({
        size: canvasSize,
        renderPasses: [drawFill, drawEdge],
        attachments: {
            color: {
                type: "color",
                format: GLColorStoreFormat.RGBA_8,
            },
        },
        clearColor: [0, 0, 0, 0],
    });

    return {layerOverlay: rendertarget};

}


export function createUnitHexagonSlice(): ArrayBuffer {
    const buffer = new ArrayBuffer(3 * 6 * Float32Array.BYTES_PER_ELEMENT);
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
    pushPosition(0, 0)
    pushCorner(0, 0, 1)

    // corner a
    pushPosition(pointerA[0], pointerA[1]);
    pushCorner(1, 0, 0)

    // corner b
    pushPosition(pointerB[0], pointerB[1]);
    pushCorner(0, 1, 0)

    return buffer;
}

function deg2rad(degrees: number): number {
    return degrees * (Math.PI / 180);
}