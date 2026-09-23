import type {RenderGraphBuilder} from "@modules/rendergraph/render-graph-builder.ts";
import type {GameRendererDataProvider, RendererMapInteractionMode} from "@pages/game/renderer/data/game-renderer-data-provider.ts";
import type {DataRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.data.ts";
import type {VersionedContainer} from "@pages/game/renderer/data/versioned-data.ts";
import type {DebugData} from "@app/features/game/database/debug.database.ts";
import type {CameraRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.camera.ts";
import type {HexPosition} from "@app/features/game/models/hex-position.ts";
import {GlAttributeType} from "@modules/rendergraph/webgl/gl-program.ts";
import SHADER_TILE_HIGHLIGHT_VERT from "@pages/game/renderer/shader/tileHighlight/tileHighlight.vsh";
import SHADER_TILE_HIGHLIGHT_FRAG from "@pages/game/renderer/shader/tileHighlight/tileHighlight.fsh";
import {DepthFunc} from "@modules/rendergraph/nodes/rg-node.draw.ts";

export function renderTileHighlight(
    g: RenderGraphBuilder,
    dataProvider: GameRendererDataProvider,
    inputs: {
        dataDebug: DataRenderGraphNode<VersionedContainer<DebugData>>,
        camera: CameraRenderGraphNode,
        dataPointerHexPosition: DataRenderGraphNode<[number, number]>
    },
) {

    const dataInteractionMode = g.dataExternal<RendererMapInteractionMode>(
        prev => prev != dataProvider.getInteractionMode(),
        () => dataProvider.getInteractionMode(),
    );

    const dataSelectedTile = g.dataExternal<HexPosition | null>(
        prev => prev?.q != dataProvider.getSelectedTilePosition()?.q || prev?.r != dataProvider.getSelectedTilePosition()?.r,
        () => dataProvider.getSelectedTilePosition(),
    );

    const dataSelectableTiles = g.dataExternal<VersionedContainer<HexPosition[]>>(
        prev => prev?.revId != dataProvider.getSelectableTilePositions().revId,
        () => dataProvider.getSelectableTilePositions().load(),
    );

    const dataHighlightedTiles = g.dataTransformer(
        g.transform({
            inputs: [dataInteractionMode, dataSelectedTile, dataSelectableTiles],
            func: (mode: RendererMapInteractionMode, selectedTile, selectableTiles) => {
                if (mode === "pick-tile") {
                    return selectableTiles.data.map(it => ({ position: it, type: 2}))
                } else {
                    return selectedTile
                        ? [{ position: selectedTile, type: 1}]
                        : [];
                }
            },
            checkChanged: (prev, next) => {
                if(prev == null && next == null) {
                    return false
                }
                if(prev == null || next == null){
                    return true
                }
                if(prev.length === 0 && next.length === 0) {
                    return false
                }
                if(prev.length === 1 && next.length === 1) {
                    const posPrev = prev[0].position
                    const posNext = next[0].position
                    return !(posPrev.q === posNext.q && posPrev.r === posNext.r && prev[0].type === next[0].type)
                }
                return true
            },
        }),
    );

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
                    data: createTileHighlightMesh(),
                    count: 6 + DEFAULT_PILLAR_SEGMENTS * 6,
                },
            };

        },
    });

    const instanceTransformer = g.transformVertexOut({
        inputs: [dataHighlightedTiles],
        outputs: {
            instances: {
                content: "instances",
                layout: [
                    {
                        name: "tilePosition",
                        type: GlAttributeType.FLOAT,
                        amountComponents: 2,
                    },
                    {
                        name: "type",
                        type: GlAttributeType.INT,
                        amountComponents: 1,
                    },
                ],
            },
        },
        func: (tiles: { position: HexPosition, type: number }[]) => {

            const buffer = new ArrayBuffer(tiles.length * 2 * GlAttributeType.FLOAT.bytes + tiles.length * GlAttributeType.INT.bytes);
            const view = new DataView(buffer);
            let viewCounter = 0;

            function pushFloat32(value: number) {
                view.setFloat32(viewCounter, value, true);
                viewCounter += GlAttributeType.FLOAT.bytes;
            }

            function pushInt32(value: number) {
                view.setInt32(viewCounter, value, true);
                viewCounter += GlAttributeType.INT.bytes;
            }

            function pushFloat32Vec2(x: number, y: number) {
                pushFloat32(x);
                pushFloat32(y);
            }

            for (const tile of tiles) {
                pushFloat32Vec2(tile.position.q, tile.position.r);
                pushInt32(tile.type);
            }

            return {
                "instances": {
                    data: buffer,
                    count: tiles.length,
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
            g.geometrySource({
                source: instanceTransformer,
                output: "instances",
            }),
        ],
    });

    const shader = g.shader({
        srcVertex: SHADER_TILE_HIGHLIGHT_VERT,
        srcFragment: SHADER_TILE_HIGHLIGHT_FRAG,
        prefixUniforms: "u_",
        prefixVertexAttributes: "in_",
    });

    const texturePaintCircle = g.texture({
        url: "/sprites/paint-circle_v2.jpg",
    });


    const drawFront = g.draw({
        shader: shader,
        geometry: geometry,
        inputs: {
            "camera": inputs.camera,
            "paintCircle": texturePaintCircle,
            "side": g.dataConst(1) as DataRenderGraphNode<unknown>,
            "pointerPosition": inputs.dataPointerHexPosition as DataRenderGraphNode<unknown>
        },
        writeDepth: false,
        testDepth: DepthFunc.LESS_OR_EQUAL,
    });

    const drawBack = g.draw({
        shader: shader,
        geometry: geometry,
        inputs: {
            "camera": inputs.camera,
            "paintCircle": texturePaintCircle,
            "side": g.dataConst(2) as DataRenderGraphNode<unknown>,
            "pointerPosition": inputs.dataPointerHexPosition as DataRenderGraphNode<unknown>
        },
        writeDepth: false,
        testDepth: DepthFunc.GREATER,
    });


    return {
        drawSelectedTileFront: drawFront,
        drawSelectedTileBack: drawBack,
    };
}


const DEFAULT_PILLAR_RADIUS = 0.8;
const DEFAULT_PILLAR_HEIGHT = 4;
const DEFAULT_PILLAR_SEGMENTS = 16;
const GROUND_U_MIN = 0;
const GROUND_U_MAX = 0.5;
const PILLAR_U_MIN = 0.5;
const PILLAR_U_MAX = 1;
const PILLAR_SEAM_ANGLE = Math.PI / 2;

function createTileHighlightMesh(): ArrayBuffer {
    const vertices: number[] = [];

    function pushVertex(x: number, y: number, z: number, u: number, v: number): void {
        vertices.push(x, y, z, u, v);
    }

    function pushTriangle(
        a: [number, number, number, number, number],
        b: [number, number, number, number, number],
        c: [number, number, number, number, number],
    ): void {
        pushVertex(...a);
        pushVertex(...b);
        pushVertex(...c);
    }

    // Selection texture on the ground plane.
    pushTriangle(
        [-1, 0, -1, GROUND_U_MIN, 0],
        [1, 0, -1, GROUND_U_MAX, 0],
        [1, 0, 1, GROUND_U_MAX, 1],
    );
    pushTriangle(
        [-1, 0, -1, GROUND_U_MIN, 0],
        [-1, 0, 1, GROUND_U_MIN, 1],
        [1, 0, 1, GROUND_U_MAX, 1],
    );

    // Cylinder sides. U wraps once around the pillar and V runs bottom to top.
    for (let segment = 0; segment < DEFAULT_PILLAR_SEGMENTS; segment++) {

        const angleA = PILLAR_SEAM_ANGLE + (segment / DEFAULT_PILLAR_SEGMENTS) * Math.PI * 2;
        const angleB = PILLAR_SEAM_ANGLE + ((segment + 1) / DEFAULT_PILLAR_SEGMENTS) * Math.PI * 2;

        const uA = PILLAR_U_MIN + (segment / DEFAULT_PILLAR_SEGMENTS) * (PILLAR_U_MAX - PILLAR_U_MIN);
        const uB = PILLAR_U_MIN + ((segment + 1) / DEFAULT_PILLAR_SEGMENTS) * (PILLAR_U_MAX - PILLAR_U_MIN);

        const bottomA: [number, number, number, number, number] = [
            Math.cos(angleA) * DEFAULT_PILLAR_RADIUS, 0, Math.sin(angleA) * DEFAULT_PILLAR_RADIUS, uA, 0,
        ];

        const bottomB: [number, number, number, number, number] = [
            Math.cos(angleB) * DEFAULT_PILLAR_RADIUS, 0, Math.sin(angleB) * DEFAULT_PILLAR_RADIUS, uB, 0,
        ];

        const topA: [number, number, number, number, number] = [bottomA[0], DEFAULT_PILLAR_HEIGHT, bottomA[2], uA, 1];

        const topB: [number, number, number, number, number] = [bottomB[0], DEFAULT_PILLAR_HEIGHT, bottomB[2], uB, 1];

        pushTriangle(bottomB, bottomA, topA);
        pushTriangle(bottomB, topA, topB);
    }

    return new Float32Array(vertices).buffer;
}
