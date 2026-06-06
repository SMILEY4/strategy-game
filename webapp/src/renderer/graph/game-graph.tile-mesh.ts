import type {RenderGraphBuilder} from "@/modules/rendergraph/render-graph-builder.ts";
import {GlAttributeType} from "@/modules/rendergraph/webgl/gl-program.ts";
import {vec2} from "gl-matrix";

export function gameGraphTileMesh(g: RenderGraphBuilder) {

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

    return {tileMeshTransformer};

}

function deg2rad(degrees: number): number {
    return degrees * (Math.PI / 180);
}