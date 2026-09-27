import type {RenderGraphBuilder} from "@modules/rendergraph/render-graph-builder.ts";
import type {DataRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.data.ts";
import type {VersionedContainer} from "@pages/game/renderer/data/versioned-data.ts";
import type {CameraRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.camera.ts";
import type {Camera} from "@app/features/game/models/camera.ts";
import {GlAttributeType} from "@modules/rendergraph/webgl/gl-program.ts";
import {buildFullscreenQuad} from "@pages/game/renderer/graph/build-fullscreen-quad.ts";
import SHADER_VERT from "@pages/game/renderer/shader/testPlane/testPlane.vsh";
import SHADER_FRAG from "@pages/game/renderer/shader/testPlane/testPlane.fsh";
import {DepthFunc} from "@modules/rendergraph/nodes/rg-node.draw.ts";
import type {RendertargetRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.rendertarget.ts";

export function renderTestPlane(
    g: RenderGraphBuilder,
    inputs: {
        camera: CameraRenderGraphNode,
        cameraData: DataRenderGraphNode<VersionedContainer<Camera>>,
        fogOfWarMask: RendertargetRenderGraphNode<"color">
    },
) {

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

    const canvasSize = g.canvasSize();

    const draw1 = g.draw({
        shader: shader,
        geometry: geometry,
        inputs: {
            "camera": inputs.camera,
            "cameraPosition": g.dataTransformer(
                g.transform({
                    inputs: [inputs.cameraData],
                    func: (data) => data.data.position,
                }),
            ) as DataRenderGraphNode<unknown>,
            "cameraFarDistance": g.dataTransformer(
                g.transform({
                    inputs: [inputs.cameraData],
                    func: (data) => data.data.far,
                }),
            ) as DataRenderGraphNode<unknown>,
            "resolution": canvasSize,
            "mask": g.pickRendertargetAttachment({
                rendertarget: inputs.fogOfWarMask,
                attachment: "color",
            }),
            "pass": g.dataConst(1) as DataRenderGraphNode<unknown>,
        },
        writeDepth: false,
        testDepth: DepthFunc.ALWAYS,
    });

    const draw2 = g.draw({
        shader: shader,
        geometry: geometry,
        inputs: {
            "camera": inputs.camera,
            "cameraPosition": g.dataTransformer(
                g.transform({
                    inputs: [inputs.cameraData],
                    func: (data) => data.data.position,
                }),
            ) as DataRenderGraphNode<unknown>,
            "cameraFarDistance": g.dataTransformer(
                g.transform({
                    inputs: [inputs.cameraData],
                    func: (data) => data.data.far,
                }),
            ) as DataRenderGraphNode<unknown>,
            "resolution": canvasSize,
            "mask": g.pickRendertargetAttachment({
                rendertarget: inputs.fogOfWarMask,
                attachment: "color",
            }),
            "pass": g.dataConst(2) as DataRenderGraphNode<unknown>,
        },
        writeDepth: false,
        testDepth: DepthFunc.LESS,
    });

    return {
        drawTestPlane1: draw1,
        drawTestPlane2: draw2
    }
}