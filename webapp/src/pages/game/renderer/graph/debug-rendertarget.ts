import type {RenderGraphBuilder} from "@modules/rendergraph/render-graph-builder.ts";
import type {RendertargetRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.rendertarget.ts";
import {GlAttributeType} from "@modules/rendergraph/webgl/gl-program.ts";
import type {DrawRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.draw.ts";
import {buildFullscreenQuad} from "@pages/game/renderer/graph/build-fullscreen-quad.ts";

import SHADER_VERT from "./../shader/debug/dbgRendertarget.vsh";
import SHADER_FRAG from "./../shader/debug/dbgRendertarget.fsh";

export function debugVisRendertarget(
    g: RenderGraphBuilder,
    rendertarget: RendertargetRenderGraphNode<any>,
): DrawRenderGraphNode {

    const fullscreenMeshTransformer = g.transformVertexOut({
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
            return {
                "mesh": buildFullscreenQuad()
            };
        },
    });

    const geometry = g.geometry({
        sources: [
            g.geometrySource({
                source: fullscreenMeshTransformer,
                output: "mesh",
            }),
        ],
    });

    const shader = g.shader({
        srcVertex: SHADER_VERT,
        srcFragment: SHADER_FRAG,
        prefixUniforms: "u_",
        prefixVertexAttributes: "in_",
    });

    return g.draw({
        shader: shader,
        geometry: geometry,
        inputs: {
            "rendertarget": g.pickRendertargetAttachment({
                rendertarget: rendertarget,
                attachment: "color",
            }),
        },
    });
}