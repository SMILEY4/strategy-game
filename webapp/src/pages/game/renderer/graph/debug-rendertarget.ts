import type {RenderGraphBuilder} from "@modules/rendergraph/render-graph-builder.ts";
import type {RendertargetRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.rendertarget.ts";
import {GlAttributeType} from "@modules/rendergraph/webgl/gl-program.ts";
import type {DrawRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.draw.ts";
import {buildFullscreenQuad} from "@pages/game/renderer/graph/build-fullscreen-quad.ts";

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
        srcVertex:
            "#version 300 es\n" +
            "\n" +
            "in vec2 in_vertexPosition;\n" +
            "\n" +
            "out vec2 v_textureCoordinates;\n" +
            "\n" +
            "void main() {\n" +
            "    v_textureCoordinates = (in_vertexPosition + 1.0) * 0.5;\n" +
            "    gl_Position = vec4(in_vertexPosition, 0.0, 1.0);\n" +
            "}",
        srcFragment:
            "#version 300 es\n" +
            "precision mediump float;\n" +
            "\n" +
            "in vec2 v_textureCoordinates;\n" +
            "\n" +
            "uniform sampler2D u_rendertarget;\n" +
            "\n" +
            "out vec4 outColor;\n" +
            "\n" +
            "void main() {\n" +
            "    vec4 color = texture(u_rendertarget, v_textureCoordinates);\n" +
            "    outColor = color;\n" +
            "}",
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