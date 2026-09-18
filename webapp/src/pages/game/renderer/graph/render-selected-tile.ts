import type {RenderGraphBuilder} from "@modules/rendergraph/render-graph-builder.ts";
import type {GameRendererDataProvider} from "@pages/game/renderer/data/game-renderer-data-provider.ts";
import type {DataRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.data.ts";
import type {VersionedContainer} from "@pages/game/renderer/data/versioned-data.ts";
import type {DebugData} from "@app/features/game/database/debug.database.ts";
import type {CameraRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.camera.ts";
import type {HexPosition} from "@app/features/game/models/hex-position.ts";
import {GlAttributeType} from "@modules/rendergraph/webgl/gl-program.ts";
import SHADER_SELECTED_TILE_VERT from "../shader/selectedTile/selectedTile.vsh";
import SHADER_SELECTED_TILE_FRAG from "../shader/selectedTile/selectedTile.fsh";
import {DepthFunc} from "@modules/rendergraph/nodes/rg-node.draw.ts";

export function renderSelectedTile(
    g: RenderGraphBuilder,
    dataProvider: GameRendererDataProvider,
    inputs: {
        dataDebug: DataRenderGraphNode<VersionedContainer<DebugData>>,
        camera: CameraRenderGraphNode,
    },
) {

    const dataSelectedTile = g.dataExternal<HexPosition | null>(
        prev => prev?.q != dataProvider.getSelectedTilePosition()?.q || prev?.r != dataProvider.getSelectedTilePosition()?.r,
        () => dataProvider.getSelectedTilePosition(),
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
                    data: createSelectedTileMesh(),
                    count: 6 + DEFAULT_PILLAR_SEGMENTS * 9,
                },
            };

        },
    });

    const instanceTransformer = g.transformVertexOut({
        inputs: [dataSelectedTile],
        outputs: {
            instances: {
                content: "instances",
                layout: [
                    {
                        name: "tilePosition",
                        type: GlAttributeType.FLOAT,
                        amountComponents: 2,
                    },
                ],
            },
        },
        func: (selectedTile: HexPosition | null) => {

            const buffer = new ArrayBuffer((selectedTile === null ? 0 : 1) * 2 * GlAttributeType.FLOAT.bytes);
            const view = new DataView(buffer);
            let viewCounter = 0;

            function pushFloat32(value: number) {
                view.setFloat32(viewCounter, value, true);
                viewCounter += GlAttributeType.FLOAT.bytes;
            }

            function pushFloat32Vec2(x: number, y: number) {
                pushFloat32(x);
                pushFloat32(y);
            }

            if (selectedTile) {
                pushFloat32Vec2(selectedTile.q, selectedTile.r);
            }

            return {
                "instances": {
                    data: buffer,
                    count: (selectedTile === null ? 0 : 1),
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
        srcVertex: SHADER_SELECTED_TILE_VERT,
        srcFragment: SHADER_SELECTED_TILE_FRAG,
        prefixUniforms: "u_",
        prefixVertexAttributes: "in_",
    });

    const texturePaintCircle = g.texture({
        url: "/sprites/paint-circle.jpg",
    });


    const drawFront = g.draw({
        shader: shader,
        geometry: geometry,
        inputs: {
            "camera": inputs.camera,
            "paintCircle": texturePaintCircle,
            "side": g.dataConst(1) as DataRenderGraphNode<unknown>,
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
        },
        writeDepth: false,
        testDepth: DepthFunc.GREATER,
    });


    return {
        drawSelectedTileFront: drawFront,
        drawSelectedTileBack: drawBack
    }
}



const DEFAULT_PILLAR_RADIUS = 1;
const DEFAULT_PILLAR_HEIGHT = 4;
const DEFAULT_PILLAR_SEGMENTS = 16;

function createSelectedTileMesh(): ArrayBuffer {
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

    function capUv(value: number): number {
        return 0.5 + value / (2 * DEFAULT_PILLAR_RADIUS || 1);
    }

    // Selection texture on the ground plane.
    pushTriangle(
        [-1, 0, -1, 0, 0],
        [1, 0, -1, 1, 0],
        [1, 0, 1, 1, 1],
    );
    pushTriangle(
        [-1, 0, -1, 0, 0],
        [-1, 0, 1, 0, 1],
        [1, 0, 1, 1, 1],
    );

    // Cylinder sides. U wraps once around the pillar and V runs bottom to top.
    for (let segment = 0; segment < DEFAULT_PILLAR_SEGMENTS; segment++) {
        const angleA = (segment / DEFAULT_PILLAR_SEGMENTS) * Math.PI * 2;
        const angleB = ((segment + 1) / DEFAULT_PILLAR_SEGMENTS) * Math.PI * 2;
        const uA = segment / DEFAULT_PILLAR_SEGMENTS;
        const uB = (segment + 1) / DEFAULT_PILLAR_SEGMENTS;
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

        // Top cap, mapped like a conventional circular texture.
        pushTriangle(
            [0, DEFAULT_PILLAR_HEIGHT, 0, 0.5, 0.5],
            [topB[0], topB[1], topB[2], capUv(topB[0]), capUv(topB[2])],
            [topA[0], topA[1], topA[2], capUv(topA[0]), capUv(topA[2])],
        );
    }

    return new Float32Array(vertices).buffer;
}