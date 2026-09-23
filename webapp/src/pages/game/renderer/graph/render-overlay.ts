import type {RenderGraphBuilder} from "@modules/rendergraph/render-graph-builder.ts";
import type {VersionedContainer} from "@pages/game/renderer/data/versioned-data.ts";
import type {DebugData} from "@app/features/game/database/debug.database.ts";
import SHADER_OVERLAY_FILL_VERT from "@pages/game/renderer/shader/overlay/overlayFill.vsh";
import SHADER_OVERLAY_FILL_FRAG from "@pages/game/renderer/shader/overlay/overlayFill.fsh";
import SHADER_OVERLAY_BORDER_VERT from "@pages/game/renderer/shader/overlay/overlayBorder.vsh";
import SHADER_OVERLAY_BORDER_FRAG from "@pages/game/renderer/shader/overlay/overlayBorder.fsh";
import type {MapMode} from "@app/features/game/models/map-mode.ts";
import {type Entity, EntityUtils} from "@app/features/game/models/entity.ts";
import type {GameRendererDataProvider} from "@pages/game/renderer/data/game-renderer-data-provider.ts";
import type {RenderWasmApi} from "@pages/game/renderer/wasm/render-wasm-api.ts";
import type {DataRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.data.ts";
import type {CameraRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.camera.ts";
import {GlAttributeType} from "@modules/rendergraph/webgl/gl-program.ts";
import {createUnitHexagonMesh} from "@modules/utilities/hex-geometry.ts";
import type {WasmDataRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.wasm-data.ts";
import {vec2} from "gl-matrix";
import {DepthFunc} from "@modules/rendergraph/nodes/rg-node.draw.ts";
import SHADER_ROUTE_HIGHLIGHT_VERT from "@pages/game/renderer/shader/overlay/routeHighlight.vsh";
import SHADER_ROUTE_HIGHLIGHT_FRAG from "@pages/game/renderer/shader/overlay/routeHighlight.fsh";

export function renderOverlay(
    g: RenderGraphBuilder,
    dataProvider: GameRendererDataProvider,
    wasmApi: RenderWasmApi,
    inputs: {
        dataDebug: DataRenderGraphNode<VersionedContainer<DebugData>>,
        camera: CameraRenderGraphNode,
        visibleChunks: WasmDataRenderGraphNode,
    },
) {

    //====================== DATA SETUP =====================================

    const dataMapMode = g.dataExternal<MapMode>(
        prev => prev.id !== dataProvider.getMapMode().id,
        () => dataProvider.getMapMode(),
    );

    const dataSelectedEntity = g.dataExternal<Entity | null>(
        prev => prev?.id !== dataProvider.getSelectedEntity()?.id,
        () => dataProvider.getSelectedEntity(),
    );

    const wasmMapMode = g.wasmData({
        source: {
            type: "js",
            data: dataMapMode,
            upload: (mode: MapMode) => wasmApi.upload.setMapMode(mode),
        },
    });

    const wasmSelectedEntity = g.wasmData({
        source: {
            type: "js",
            data: dataSelectedEntity,
            upload: (entity: Entity | null) => {
                wasmApi.upload.setSelectedEntityId(entity?.id ?? null);
                wasmApi.upload.setSelectedSettlementId(
                    entity
                        ? EntityUtils.getComponent(entity, "tile-improvement")?.administeringSettlement
                        ?? (EntityUtils.hasComponent(entity, "settlement") ? entity.id : null)
                        : null,
                );
            },
        },
    });

    const calculateOverlayInstances = g.wasmOperation({
        wasmInputs: [inputs.visibleChunks, wasmMapMode, wasmSelectedEntity],
        dataInputs: [],
        outputs: ["overlayFillInstances", "overlayEdgeInstances", "routeHighlightVertices"],
        func: () => wasmApi.operations.calculateOverlayInstances(),
    });

    //====================== DRAW FILL ======================================

    const wasmOverlayFillInstances = g.wasmData({
        source: {
            type: "wasm",
            operation: calculateOverlayInstances,
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
                download: () => wasmApi.download.getOverlayFillInstances(),
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
        srcVertex: SHADER_OVERLAY_FILL_VERT,
        srcFragment: SHADER_OVERLAY_FILL_FRAG,
        prefixUniforms: "u_",
        prefixVertexAttributes: "in_",
    });


    const drawFill = g.draw({
        shader: shaderFill,
        geometry: geometryFill,
        inputs: {
            "camera": inputs.camera,
        },
        writeDepth: false,
        testDepth: DepthFunc.ALWAYS,
    });

    //====================== DRAW BORDER ====================================

    const wasmOverlayBorderInstances = g.wasmData({
        source: {
            type: "wasm",
            operation: calculateOverlayInstances,
            key: "overlayEdgeInstances",
        },
    });

    const meshTransformerBorder = g.transformVertexOut({
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
                    count: 3 * 3,
                },
            };
        },
    });

    const geometryBorder = g.geometry({
        sources: [
            g.geometrySource({
                source: meshTransformerBorder,
                output: "mesh",
            }),
            g.wasmGeometrySource({
                source: wasmOverlayBorderInstances,
                download: () => wasmApi.download.getOverlayEdgeInstances(),
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
                        name: "style",
                        type: GlAttributeType.U_INT,
                        amountComponents: 1,
                    },
                    {
                        name: "color",
                        type: GlAttributeType.FLOAT,
                        amountComponents: 4,
                    },
                    {
                        name: "thickness",
                        type: GlAttributeType.FLOAT,
                        amountComponents: 1,
                    },
                ],
            }),
        ],
    });

    const shaderBorder = g.shader({
        srcVertex: SHADER_OVERLAY_BORDER_VERT,
        srcFragment: SHADER_OVERLAY_BORDER_FRAG,
        prefixUniforms: "u_",
        prefixVertexAttributes: "in_",
    });


    const texturePaintLine = g.texture({
        url: "/sprites/paint-line_v2.jpg",
    });

    const drawBorderFront = g.draw({
        shader: shaderBorder,
        geometry: geometryBorder,
        inputs: {
            "camera": inputs.camera,
            "paintLine": texturePaintLine,
            "side": g.dataConst(1) as DataRenderGraphNode<unknown>,
        },
        writeDepth: false,
        testDepth: DepthFunc.LESS_OR_EQUAL,
    });

    const drawBorderBack = g.draw({
        shader: shaderBorder,
        geometry: geometryBorder,
        inputs: {
            "camera": inputs.camera,
            "paintLine": texturePaintLine,
            "side": g.dataConst(2) as DataRenderGraphNode<unknown>,
        },
        writeDepth: false,
        testDepth: DepthFunc.GREATER,
    });

    //====================== DRAW ROUTE HIGHLIGHT ===========================

    const wasmRouteHighlightVertices = g.wasmData({
        source: {
            type: "wasm",
            operation: calculateOverlayInstances,
            key: "routeHighlightVertices",
        },
    });

    const geometryRouteHighlight = g.geometry({
        sources: [
            g.wasmGeometrySource({
                source: wasmRouteHighlightVertices,
                download: () => wasmApi.download.getRouteHighlightVertices(),
                content: "vertices",
                layout: [
                    {
                        name: "vertexPosition",
                        type: GlAttributeType.FLOAT,
                        amountComponents: 2,
                    },
                    {
                        name: "textureCoordinates",
                        type: GlAttributeType.FLOAT,
                        amountComponents: 2,
                    },
                    {
                        name: "pathLength",
                        type: GlAttributeType.FLOAT,
                        amountComponents: 1,
                    },
                ],
            }),
        ],
    });

    const shader = g.shader({
        srcVertex: SHADER_ROUTE_HIGHLIGHT_VERT,
        srcFragment: SHADER_ROUTE_HIGHLIGHT_FRAG,
        prefixUniforms: "u_",
        prefixVertexAttributes: "in_",
    });

    const drawRouteHighlight = g.draw({
        shader: shader,
        geometry: geometryRouteHighlight,
        inputs: {
            "camera": inputs.camera,
            "texture": texturePaintLine,
        },
        writeDepth: false,
        testDepth: DepthFunc.ALWAYS,
    });

    //====================== OUTPUT =========================================

    return {
        drawOverlayFill: drawFill,
        drawOverlayBorderBack: drawBorderBack,
        drawOverlayBorderFront: drawBorderFront,
        drawRouteHighlight: drawRouteHighlight,
    };
}


export function createUnitHexagonSlice(): ArrayBuffer {
    const numTriangles = 3;
    const numVertices = numTriangles * 3;
    const buffer = new ArrayBuffer(numVertices * 6 * Float32Array.BYTES_PER_ELEMENT);
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

    // Main edge points (0° to 60°)
    const pointerA = vec2.fromValues(0, 1);
    const pointerB = vec2.fromValues(0, 1);
    vec2.rotate(pointerB, pointerB, center, deg2rad(60));

    // Left wing point (-60°)
    const pointerLeft = vec2.fromValues(0, 1);
    vec2.rotate(pointerLeft, pointerLeft, center, deg2rad(-60));

    // Right wing point (120°)
    const pointerRight = vec2.fromValues(0, 1);
    vec2.rotate(pointerRight, pointerRight, center, deg2rad(120));

    // --- Triangle 1: Main (Center) Slice ---
    pushPosition(0, 0);
    pushCorner(0, 0, 1);

    pushPosition(pointerA[0], pointerA[1]);
    pushCorner(1, 0, 0);

    pushPosition(pointerB[0], pointerB[1]);
    pushCorner(0, 1, 0);

    // --- Triangle 2: Left Wing (-60° to 0°) ---
    pushPosition(0, 0);
    pushCorner(0, 0, 1);

    pushPosition(pointerLeft[0], pointerLeft[1]);
    pushCorner(1, 0, 1);

    pushPosition(pointerA[0], pointerA[1]);
    pushCorner(1, 0, 0);

    // --- Triangle 3: Right Wing (60° to 120°) ---
    pushPosition(0, 0);
    pushCorner(0, 0, 1);

    pushPosition(pointerB[0], pointerB[1]);
    pushCorner(0, 1, 0);

    pushPosition(pointerRight[0], pointerRight[1]);
    pushCorner(0, 1, 1);

    return buffer;
}

function deg2rad(degrees: number): number {
    return degrees * (Math.PI / 180);
}
