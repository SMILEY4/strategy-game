import type {RenderGraphBuilder} from "@modules/rendergraph/render-graph-builder.ts";
import type {CameraRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.camera.ts";
import type {DataRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.data.ts";
import type {Camera} from "@app/features/game/models/camera.ts";
import type {RendertargetRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.rendertarget.ts";
import {GlAttributeType} from "@modules/rendergraph/webgl/gl-program.ts";
import {buildFullscreenQuad} from "@pages/game/renderer/graph/utils/build-fullscreen-quad.ts";
import SHADER_VERT from "@pages/game/renderer/shader/fogofwar/fogOfWar.vsh";
import SHADER_FRAG from "@pages/game/renderer/shader/fogofwar/fogOfWar.fsh";
import {DepthFunc} from "@modules/rendergraph/nodes/rg-node.draw.ts";
import type {DeveloperSettings} from "@app/features/game/database/developer-settings.database.ts";
import type {VersionedContainer} from "@pages/game/renderer/data/versioned-data.ts";

export function renderFogOfWar(
    g: RenderGraphBuilder,
    inputs: {
        dataDeveloperSettings: DataRenderGraphNode<VersionedContainer<DeveloperSettings>>,
        camera: CameraRenderGraphNode,
        cameraData: DataRenderGraphNode<VersionedContainer<Camera>>,
        fogOfWarMask: RendertargetRenderGraphNode<"color">
    },
) {

    const mesh = g.transformVertexOut({
        debugName: "fog of war fullscreen mesh",
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
        debugName: "fog of war geometry",
        sources: [
            g.geometrySource({
                source: mesh,
                output: "mesh",
            }),
        ],
    });

    const shader = g.shader({
        debugName: "fog of war shader",
        srcVertex: SHADER_VERT,
        srcFragment: SHADER_FRAG,
        prefixUniforms: "u_",
        prefixVertexAttributes: "in_",
    });

    const drawLayer1 = g.draw({
        debugName: "fog of war discovered layer",
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
            "resolution": g.canvasSize(),
            "mask": g.pickRendertargetAttachment({
                rendertarget: inputs.fogOfWarMask,
                attachment: "color",
            }),
            "pass": g.dataConst(1) as DataRenderGraphNode<unknown>,
            "discoveredOpacity": g.dataTransformer(
                g.transform({
                    inputs: [inputs.dataDeveloperSettings],
                    func: data => data.data.renderer.fogOfWar.discoveredOpacity,
                }),
            ) as DataRenderGraphNode<unknown>,
        },
        writeDepth: false,
        testDepth: DepthFunc.ALWAYS,
    });

    const drawLayer2 = g.draw({
        debugName: "fog of war hidden layer",
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
            "resolution": g.canvasSize(),
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
        drawFogOfWarLayer1: drawLayer1,
        drawFogOfWarLayer2: drawLayer2,
    };
}
