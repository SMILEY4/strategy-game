import type {RenderGraphBuilder} from "@modules/rendergraph/render-graph-builder.ts";
import type {RenderWasmApi} from "@pages/game/renderer/wasm/render-wasm-api.ts";
import type {CameraRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.camera.ts";
import type {DataRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.data.ts";
import type {DebugData} from "@app/features/game/database/debug.database.ts";
import {GlAttributeType} from "@modules/rendergraph/webgl/gl-program.ts";
import {createUnitHexagonMesh} from "@modules/utilities/hex-geometry.ts";
import {GLColorStoreFormat} from "@modules/rendergraph/webgl/gl-framebuffer.ts";
import SHADER_COMPOSE_VERT from "./../shader/overlayGrid.vsh";
import SHADER_COMPOSE_FRAG from "./../shader/overlayGrid.fsh";
import type {PointerPosition} from "@app/features/game/database/pointer-position.database.ts";
import type {VersionedContainer} from "@pages/game/renderer/data/versioned-data.ts";

export function gameGraphPassTileGrid(
    g: RenderGraphBuilder,
    wasmApi: RenderWasmApi,
    inputs: {
        camera: CameraRenderGraphNode,
        dataPointerPosition: DataRenderGraphNode<VersionedContainer<PointerPosition>>,
        dataDebug: DataRenderGraphNode<VersionedContainer<DebugData>>
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
                download: () => wasmApi.download.downloadOverlayGridInstances(),
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

    const dataDebugHexOffsetScale = g.dataTransformer(
        g.transform({
            inputs: [inputs.dataDebug],
            func: (data) => data.data.renderer.randomHexOffsetScale,
        }),
    );

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

    const dataPointerHexPosition = g.dataTransformer(
        g.transform({
            inputs: [inputs.dataPointerPosition],
            func: (data) => data.data.hex,
        }),
    );

    const dataPointerWorldPosition = g.dataTransformer(
        g.transform({
            inputs: [inputs.dataPointerPosition],
            func: (data) => data.data.world,
        }),
    );

    const draw = g.draw({
        shader: shader,
        geometry: geometry,
        inputs: {
            "camera": inputs.camera,
            "pointerHexPosition": dataPointerHexPosition as DataRenderGraphNode<unknown>,
            "pointerWorldPosition": dataPointerWorldPosition as DataRenderGraphNode<unknown>,
            "dbg_hexOffsetScale": dataDebugHexOffsetScale as DataRenderGraphNode<unknown>,
            "thickness": dataDebugThickness as DataRenderGraphNode<unknown>,
            "color": dataDebugColor as DataRenderGraphNode<unknown>,
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

    return {
        layerTileGrid: rendertarget,
    };
}