import type {VersionedContainer} from "@pages/game/renderer/data/versioned-data.ts";
import type {RenderGraphBuilder} from "@modules/rendergraph/render-graph-builder.ts";
import type {RenderWasmApi} from "@pages/game/renderer/wasm/render-wasm-api.ts";
import type {CameraRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.camera.ts";
import type {DataRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.data.ts";
import type {DebugData} from "@app/features/game/database/debug.database.ts";
import {GlAttributeType} from "@modules/rendergraph/webgl/gl-program.ts";
import {createUnitHexagonMesh} from "@modules/utilities/hex-geometry.ts";
import SHADER_COMPOSE_VERT from "../shader/tileGrid/tileGrid.vsh";
import SHADER_COMPOSE_FRAG from "../shader/tileGrid/tileGrid.fsh";

export function renderTileGrid(
    g: RenderGraphBuilder,
    wasmApi: RenderWasmApi,
    inputs: {
        camera: CameraRenderGraphNode,
        dataDebug: DataRenderGraphNode<VersionedContainer<DebugData>>
        dataPointerWorldPosition: DataRenderGraphNode<[number, number]>
        dataPointerHexPosition: DataRenderGraphNode<[number, number]>
    },
) {

    const gridMeshTransformer = g.transformVertexOut({
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
                        name: "center",
                        type: GlAttributeType.FLOAT,
                        amountComponents: 1,
                    },
                ],
            },
        },
        func: () => {
            return {
                "mesh": {
                    data: createUnitHexagonMesh(false, true),
                    count: 6 * 3,
                },
            };
        },
    });


    const buildGridInstances = g.wasmOperation({
        wasmInputs: [],
        dataInputs: [],
        outputs: ["gridInstances"],
        func: () => ({gridInstances: true}),
    });

    const wasmGridInstances = g.wasmData({
        source: {
            type: "wasm",
            operation: buildGridInstances,
            key: "gridInstances",
        },
    });

    const geometry = g.geometry({
        sources: [
            g.geometrySource({
                source: gridMeshTransformer,
                output: "mesh",
            }),
            g.wasmGeometrySource({
                source: wasmGridInstances,
                download: () => wasmApi.download.getOverlayGridInstances(),
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


    const shader = g.shader({
        srcVertex: SHADER_COMPOSE_VERT,
        srcFragment: SHADER_COMPOSE_FRAG,
        prefixUniforms: "u_",
        prefixVertexAttributes: "in_",
    });

    const dataDebugColor = g.dataTransformer(
        g.transform({
            inputs: [inputs.dataDebug],
            func: (data) => data.data.renderer.grid.color,
        }),
    );

    const dataDebugThickness = g.dataTransformer(
        g.transform({
            inputs: [inputs.dataDebug],
            func: (data) => data.data.renderer.grid.thickness,
        }),
    );

    const draw = g.draw({
        shader: shader,
        geometry: geometry,
        inputs: {
            "camera": inputs.camera,
            "pointerHexPosition": inputs.dataPointerHexPosition as DataRenderGraphNode<unknown>,
            "pointerWorldPosition": inputs.dataPointerWorldPosition as DataRenderGraphNode<unknown>,
            "thickness": dataDebugThickness as DataRenderGraphNode<unknown>,
            "color": dataDebugColor as DataRenderGraphNode<unknown>,
        },
    });

    return {
        drawTileGrid: draw,
    };
}
