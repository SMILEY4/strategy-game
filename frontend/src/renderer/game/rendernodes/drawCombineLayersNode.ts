import {DrawRenderNode} from "../../core/graph/drawRenderNode";
import {VertexFullQuadNode} from "../../core/prebuiltnodes/vertexFullquadNode";
import {NodeOutput} from "../../core/graph/nodeOutput";
import {NodeInput} from "../../core/graph/nodeInput";

export class DrawCombineLayersNode extends DrawRenderNode {

    constructor() {
        super({
            id: "drawnode.combinelayers",
            input: [
                new NodeInput.ClearColor({
                    clearColor: [0, 0, 0, 1],
                }),
                new NodeInput.Shader({
                    vertexId: "combine.vert",
                    fragmentId: "combine.frag",
                }),
                new NodeInput.RenderTarget({
                    renderTargetId: "rendertarget.tileswater",
                    binding: "u_water",
                }),
                new NodeInput.RenderTarget({
                    renderTargetId: "rendertarget.tilesland",
                    binding: "u_land",
                }),
                new NodeInput.RenderTarget({
                    renderTargetId: "rendertarget.tilesfog",
                    binding: "u_fog",
                }),
                new NodeInput.RenderTarget({
                    renderTargetId: "rendertarget.entities",
                    binding: "u_entities",
                }),
                new NodeInput.RenderTarget({
                    renderTargetId: "rendertarget.details",
                    binding: "u_details",
                }),
                new NodeInput.RenderTarget({
                    renderTargetId: "rendertarget.routes",
                    binding: "u_routes",
                }),
                new NodeInput.RenderTarget({
                    renderTargetId: "rendertarget.overlay",
                    binding: "u_overlay",
                }),
                new NodeInput.VertexDescriptor({
                    id: VertexFullQuadNode.DATA_ID,
                }),
            ],
            output: [
                new NodeOutput.Screen(),
            ],
        });
    }
}