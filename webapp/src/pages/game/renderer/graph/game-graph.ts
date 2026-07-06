import type {GameRendererDataProvider} from "@pages/game/renderer/data/game-renderer-data-provider.ts";
import type {RenderGraphBuilder} from "@modules/rendergraph/render-graph-builder.ts";
import type {RenderCamera, TileCollection} from "@pages/game/renderer/data/models.ts";
import {GlAttributeType} from "@modules/rendergraph/webgl/gl-program.ts";
import {vec2} from "gl-matrix";
import type {GameGraphWasmApi} from "@pages/game/renderer/graph/game-graph-wasm-api.ts";
import SHADER_TILEMAP_VERT from "./../shader/tilemap.vsh?raw";
import SHADER_TILEMAP_FRAG from "./../shader/tilemap.fsh?raw";

/** Build the render graph for the game scene using a builder and data provider. */
export function gameGraph(g: RenderGraphBuilder, dataProvider: GameRendererDataProvider, wasmApi: GameGraphWasmApi) {

    const canvasSize = g.canvasSize();

    const dataCamera = g.dataExternal<RenderCamera>(() => dataProvider.getCamera(), (prev) => {
        return prev?.revId !== dataProvider.getCameraRevId();
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

    const dataAllTiles = g.dataExternal<TileCollection>(() => dataProvider.getTiles(), (prev) => {
        return prev?.revId !== dataProvider.getTilesRevId();
    });

    const wasmAllTiles = g.wasmData({
        source: {
            type: "js",
            data: dataAllTiles,
            upload: (tiles: TileCollection) => wasmApi.uploadTiles(tiles),
        },
    });

    const collectChunks = g.wasmOperation({
        wasmInputs: [wasmAllTiles],
        dataInputs: [],
        outputs: ["allChunks"],
        func: () => wasmApi.collectChunks(),
    });

    const wasmAllChunks = g.wasmData({
        source: {
            type: "wasm",
            operation: collectChunks,
            key: "allChunks",
        },
    });

    const cullChunks = g.wasmOperation({
        wasmInputs: [wasmAllChunks],
        dataInputs: [dataCamera],
        outputs: ["visibleChunks"],
        func: (camera: RenderCamera) => wasmApi.cullChunks(camera),
    });

    const wasmVisibleChunks = g.wasmData({
        source: {
            type: "wasm",
            operation: cullChunks,
            key: "visibleChunks",
        },
    });

    const buildTileInstances = g.wasmOperation({
        wasmInputs: [wasmVisibleChunks, wasmAllTiles],
        dataInputs: [],
        outputs: ["tileInstances"],
        func: () => wasmApi.buildTileInstances(),
    });

    const wasmTileInstances = g.wasmData({
        source: {
            type: "wasm",
            operation: buildTileInstances,
            key: "tileInstances",
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
            g.wasmGeometrySource({
                source: wasmTileInstances,
                download: () => wasmApi.downloadTileInstances(),
                content: "instances",
                layout: [
                    {
                        name: "tilePosition",
                        type: GlAttributeType.FLOAT,
                        amountComponents: 2,
                    },
                    {
                        name: "chunkPosition",
                        type: GlAttributeType.FLOAT,
                        amountComponents: 2,
                    },
                ],
            }),
        ],
    });

    const shader = g.shader({
        srcVertex: SHADER_TILEMAP_VERT,
        srcFragment: SHADER_TILEMAP_FRAG,
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