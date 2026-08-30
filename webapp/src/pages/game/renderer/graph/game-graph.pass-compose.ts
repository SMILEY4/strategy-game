import type {RenderGraphBuilder} from "@modules/rendergraph/render-graph-builder.ts";
import {GlAttributeType} from "@modules/rendergraph/webgl/gl-program.ts";
import SHADER_COMPOSE_VERT from "./../shader/compose.vsh";
import SHADER_COMPOSE_FRAG from "./../shader/compose.fsh";
import type {RendertargetRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.rendertarget.ts";
import type {DataRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.data.ts";
import type {DebugData} from "@app/features/game/database/debug.database.ts";


export function gameGraphPassCompose(
    g: RenderGraphBuilder,
    inputs: {
        layerBaseTerrain: RendertargetRenderGraphNode<"color">,
        layerCoastlineMask: RendertargetRenderGraphNode<"color">,
        layerFogOfWar: RendertargetRenderGraphNode<"color">,
        layerMapDetails: RendertargetRenderGraphNode<"color" | "depth">,
        layerOverlay: RendertargetRenderGraphNode<"color">,
        dataDebug: DataRenderGraphNode<DebugData & { revId: string}>
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

    const dataDebugTerrainCutoff = g.dataTransformer(
        g.transform({
            inputs: [inputs.dataDebug],
            func: (data) => data.renderer.terrainMask.cutoff
        })
    )

    const draw = g.draw({
        shader: shader,
        geometry: geometry,
        inputs: {
            "layerBaseTerrain": g.pickRendertargetAttachment({
                rendertarget: inputs.layerBaseTerrain,
                attachment: "color"
            }),
            "layerCoastlineMask": g.pickRendertargetAttachment({
                rendertarget: inputs.layerCoastlineMask,
                attachment: "color"
            }),
            "layerFogOfWar": g.pickRendertargetAttachment({
                rendertarget: inputs.layerFogOfWar,
                attachment: "color"
            }),
            "layerMapDetails": g.pickRendertargetAttachment({
                rendertarget: inputs.layerMapDetails,
                attachment: "color"
            }),
            "layerOverlay": g.pickRendertargetAttachment({
                rendertarget: inputs.layerOverlay,
                attachment: "color"
            }),
            "dbg_terrainCutoff": dataDebugTerrainCutoff as DataRenderGraphNode<unknown>
        },
    });

    return {drawCompose: draw};
}