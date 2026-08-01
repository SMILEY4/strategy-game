import type {RenderGraphBuilder} from "@modules/rendergraph/render-graph-builder.ts";
import {GlAttributeType} from "@modules/rendergraph/webgl/gl-program.ts";
import SHADER_COMPOSE_VERT from "./../shader/compose.vsh";
import SHADER_COMPOSE_FRAG from "./../shader/compose.fsh";
import type {RendertargetRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.rendertarget.ts";


export function gameGraphPassCompose(
    g: RenderGraphBuilder,
    inputs: {
        layerBaseTerrain: RendertargetRenderGraphNode,
        layerCoastlineMask: RendertargetRenderGraphNode,
        layerFogOfWar: RendertargetRenderGraphNode
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
                        amountComponents: 2,
                    },
                ],
            },
        },
        func: () => {

            const buffer = new ArrayBuffer(6 * 2 * GlAttributeType.FLOAT.bytes);
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

            // triangle a
            pushFloat32Vec2(-1, -1);
            pushFloat32Vec2(+1, -1);
            pushFloat32Vec2(+1, +1);

            // triangle b
            pushFloat32Vec2(-1, -1);
            pushFloat32Vec2(-1, +1);
            pushFloat32Vec2(+1, +1);

            return {
                "mesh": {
                    data: buffer,
                    count: 6,
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
        ],
    });

    const shader = g.shader({
        srcVertex: SHADER_COMPOSE_VERT,
        srcFragment: SHADER_COMPOSE_FRAG,
        prefixUniforms: "u_",
        prefixVertexAttributes: "in_",
    });

    const draw = g.draw({
        shader: shader,
        geometry: geometry,
        inputs: {
            "layerBaseTerrain": inputs.layerBaseTerrain,
            "layerCoastlineMask": inputs.layerCoastlineMask,
            "layerFogOfWar": inputs.layerFogOfWar,
        },
    });

    return {drawCompose: draw};
}