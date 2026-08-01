import type {RenderGraphBuilder} from "@modules/rendergraph/render-graph-builder.ts";
import {GlAttributeType} from "@modules/rendergraph/webgl/gl-program.ts";
import {vec2} from "gl-matrix";
import type {GameGraphWasmApi} from "@pages/game/renderer/graph/game-graph.wasm-api.ts";
import SHADER_TILEMAP_VERT from "./../shader/tilemap.vsh";
import SHADER_TILEMAP_FRAG from "./../shader/tilemap.fsh";
import type {WasmDataRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.wasm-data.ts";
import type {CameraRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.camera.ts";


export function gameGraphPassTerrain(
    g: RenderGraphBuilder,
    wasmApi: GameGraphWasmApi,
    inputs: {
        wasmTileInstances: WasmDataRenderGraphNode,
        camera: CameraRenderGraphNode
    },
) {

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

            const buffer = new ArrayBuffer(6 * 3 * (3 + 2) * GlAttributeType.FLOAT.bytes);
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

            function pushFloat32Vec2(x: number, y: number) {
                pushFloat32(x);
                pushFloat32(y);
            }

            const center = vec2.fromValues(0, 0);
            const pointerA = vec2.fromValues(0, 1);
            const pointerB = vec2.fromValues(0, 1);
            vec2.rotate(pointerB, pointerB, center, deg2rad(60));

            for (let i = 0; i < 6; i++) {

                // center
                pushFloat32Vec3(0, 0, 0);
                pushFloat32Vec2(0.5, 0.5);

                // corner a
                pushFloat32Vec3(pointerA[0], 0, pointerA[1]);
                pushFloat32Vec2(0.5 + pointerA[0] * 0.5, 0.5 + pointerA[1] * 0.5);

                // corner b
                pushFloat32Vec3(pointerB[0], 0, pointerB[1]);
                pushFloat32Vec2(0.5 + pointerB[0] * 0.5, 0.5 + pointerB[1] * 0.5);

                // rotate triangle
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
                source: meshTransformer,
                output: "mesh",
            }),
            g.wasmGeometrySource({
                source: inputs.wasmTileInstances,
                download: () => wasmApi.downloadTileLandInstances(),
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


    const textureStamp = g.texture({
        url: "/sprites/base_terrain_shape.png",
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
            "camera": inputs.camera,
            "baseTerrain": textureStamp,
        },
    });

    const canvasSize = g.canvasSize();

    const rendertarget = g.rendertarget({
        size: canvasSize,
        renderPasses: [draw],
        colorBuffer: true,
        depthBuffer: false,
        depthTesting: false,
        clearColor: [0, 0, 0, 0],
    });

    return {layerBaseTerrain: rendertarget};
}

function deg2rad(degrees: number): number {
    return degrees * (Math.PI / 180);
}