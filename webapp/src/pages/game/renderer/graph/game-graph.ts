import type {GameRendererDataProvider} from "@pages/game/renderer/data/game-renderer-data-provider.ts";
import type {RenderGraphBuilder} from "@modules/rendergraph/render-graph-builder.ts";
import type {RenderCameraData, RenderChunk} from "@pages/game/renderer/data/models.ts";
import type {Tile} from "@app/features/game/models/tile.ts";
import {GlAttributeType} from "@modules/rendergraph/webgl/gl-program.ts";
import {vec2} from "gl-matrix";

export function gameGraph(dataProvider: GameRendererDataProvider, g: RenderGraphBuilder) {

    const canvasSize = g.canvasSize();

    const dataCamera = g.dataExternal<RenderCameraData>(() => dataProvider.getCamera(), (prev) => {
        return prev?.revId !== dataProvider.getCamera().revId;
    });

    const camera = g.cameraPerspective({
        renderTargetSize: canvasSize,
        up: g.dataTransformer(
            g.transform({
                inputs: [dataCamera],
                func: (camera) => [camera.up[0], camera.up[1], camera.up[2]],
            }),
        ),
        position: g.dataTransformer(
            g.transform({
                inputs: [dataCamera],
                func: (camera) => [camera.position[0], camera.position[1], camera.position[2]],
            }),
        ),
        direction: g.dataTransformer(
            g.transform({
                inputs: [dataCamera],
                func: (camera) => [camera.direction[0], camera.direction[1], camera.direction[2]],
            }),
        ),
        fov: g.dataTransformer(
            g.transform({
                inputs: [dataCamera],
                func: (camera) => camera.fov,
            }),
        ),
        near: g.dataTransformer(
            g.transform({
                inputs: [dataCamera],
                func: (camera) => camera.near,
            }),
        ),
        far: g.dataTransformer(
            g.transform({
                inputs: [dataCamera],
                func: (camera) => camera.far,
            }),
        ),
    });

    const dataAllTiles = g.dataExternal<Tile[]>(() => dataProvider.getTiles(), (_prev) => {
        return true; // todo
    });

    const collectChunks = g.transform<[Tile[]], RenderChunk[]>({
        inputs: [dataAllTiles],
        func: (_tiles: Tile[]) => [],
    });

    const dataAllChunks = g.dataTransformer<RenderChunk[]>(collectChunks);

    const cullChunks = g.transform<[RenderChunk[], RenderCameraData], RenderChunk[]>({
        inputs: [dataAllChunks, dataCamera],
        func: (_chunks: RenderChunk[], _camera: RenderCameraData) => [],
    });

    const dataVisibleChunks = g.dataTransformer<RenderChunk[]>(cullChunks);

    const tileInstanceTransformer = g.transformVertexOut({
        inputs: [dataVisibleChunks],
        outputs: {
            instances: {
                content: "instances",
                layout: [
                    {
                        name: "worldPosition",
                        type: GlAttributeType.FLOAT,
                        amountComponents: 3,
                    },
                ],
            },
        },
        func: (_chunks: RenderChunk[]) => {

            const buffer = new ArrayBuffer(6 * 3 * 3 * GlAttributeType.FLOAT.bytes);

            return {
                "instances": {
                    data: buffer,
                    count: 6 * 3,
                },
            };
        },
    });

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
                ],
            },
        },
        func: () => {

            const buffer = new ArrayBuffer(6 * 3 * 3 * GlAttributeType.FLOAT.bytes);
            const view = new DataView(buffer);
            let viewCounter = 0;

            function pushFloat32(value: number) {
                view.setFloat32(viewCounter, value, true);
                viewCounter += GlAttributeType.FLOAT.bytes;
            }

            function pushFloat32Vec3(x: number, y: number, z: number) {
                pushFloat32(x);
                pushFloat32(y);
                pushFloat32(z);
            }

            const center = vec2.fromValues(0, 0);
            const pointerA = vec2.fromValues(0, 1);
            const pointerB = vec2.fromValues(0, 1);
            vec2.rotate(pointerB, pointerB, center, deg2rad(60));

            for (let i = 0; i < 6; i++) {
                pushFloat32Vec3(0, 0, 0);
                pushFloat32Vec3(pointerA[0], 0, pointerA[1]);
                pushFloat32Vec3(pointerB[0], 0, pointerB[1]);
                vec2.rotate(pointerA, pointerA, center, deg2rad(60));
                vec2.rotate(pointerB, pointerB, center, deg2rad(60));
            }

            return {
                "mesh": {
                    data: buffer,
                    count: 6 * 3,
                },
            };
        },
    });

    const geometry = g.geometry({
        sources: [
            g.geometrySource({
                source: tileMeshTransformer,
                output: "mesh",
            }),
            g.geometrySource({
                source: tileInstanceTransformer,
                output: "instances",
            }),
        ],
    });

    const shader = g.shader({
        srcVertex: "...",
        srcFragment: "...",
        prefixUniforms: "u_",
        prefixVertexAttributes: "in_",
    });

    const draw = g.draw({
        shader: shader,
        geometry: geometry,
        inputs: {
            "camera": camera,
        },
    });

    g.canvas({
        renderPasses: [draw],
        depthTesting: true,
        clearColor: [0, 0, 0, 0],
    });

    return g.getNodes();
}

function deg2rad(degrees: number): number {
    return degrees * (Math.PI / 180);
}