import type {RenderGraphBuilder} from "@modules/rendergraph/render-graph-builder.ts";
import type {RendertargetRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.rendertarget.ts";
import {GLColorStoreFormat} from "@modules/rendergraph/webgl/gl-texture-attachment.ts";
import {GlAttributeType} from "@modules/rendergraph/webgl/gl-program.ts";
import {buildFullscreenQuad} from "@pages/game/renderer/graph/build-fullscreen-quad.ts";
import {DepthFunc} from "@modules/rendergraph/nodes/rg-node.draw.ts";
import SHADER_WORLD_PP_VERT from "@pages/game/renderer/shader/worldPostProcess/worldPostProcess.vsh";
import SHADER_WORLD_PP_FRAG from "@pages/game/renderer/shader/worldPostProcess/worldPostProcess.fsh";

export function renderPassWorldPostProcess(
    g: RenderGraphBuilder,
    inputs: {
        world: RendertargetRenderGraphNode<"color" | "depth">
    },
): RendertargetRenderGraphNode<"color" | "depth"> {

    const mesh = g.transformVertexOut({
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
                "mesh": buildFullscreenQuad(),
            };
        },
    });


    const geometry = g.geometry({
        sources: [
            g.geometrySource({
                source: mesh,
                output: "mesh",
            }),
        ],
    });

    const shader = g.shader({
        srcVertex: SHADER_WORLD_PP_VERT,
        srcFragment: SHADER_WORLD_PP_FRAG,
        prefixUniforms: "u_",
        prefixVertexAttributes: "in_",
    });

    const draw = g.draw({
        shader: shader,
        geometry: geometry,
        inputs: {
            "worldColor": g.pickRendertargetAttachment({
                rendertarget: inputs.world,
                attachment: "color",
            }),
        },
        writeDepth: false,
        testDepth: DepthFunc.ALWAYS,
    });

    return g.rendertarget({
        size: g.canvasSize(),
        sizeScale: g.dataConst(1),
        renderPasses: [draw],
        attachments: {
            color: {
                type: "color",
                format: GLColorStoreFormat.RGBA_8,
            },
            depth: {
                type: "ref",
                source: inputs.world,
                sourceAttachmentName: "depth",
            },
        },
        clearColor: [0, 0, 0, 0],
    });
}