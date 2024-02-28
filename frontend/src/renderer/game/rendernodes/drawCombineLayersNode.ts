import {DrawRenderNode, DrawRenderNodeInput, DrawRenderNodeOutput} from "../../core/graph/drawRenderNode";
import {VertexFullQuadNode} from "../../core/prebuiltnodes/vertexFullquadNode";

export class DrawCombineLayersNode extends DrawRenderNode {

    constructor() {
        super({
            id: "drawnode.combinelayers",
            input: [
                new DrawRenderNodeInput.ClearColor({
                    clearColor: [0, 0, 0, 1],
                }),
                new DrawRenderNodeInput.Shader({
                    vertexId: "combine.vert",
                    fragmentId: "combine.frag",
                }),
                new DrawRenderNodeInput.RenderTarget({
                    renderTargetId: "rendertarget.tileswater",
                    binding: "u_water"
                }),
                new DrawRenderNodeInput.RenderTarget({
                    renderTargetId: "rendertarget.tilesland",
                    binding: "u_land"
                }),
                new DrawRenderNodeInput.RenderTarget({
                    renderTargetId: "rendertarget.tilesfog",
                    binding: "u_fog"
                }),
                new DrawRenderNodeInput.VertexData({
                    id: VertexFullQuadNode.DATA_ID,
                }),
            ],
            output: [
                new DrawRenderNodeOutput.Screen(),
            ],
        });
    }
}