import {DrawRenderNode, } from "../graph/drawRenderNode";
import {VertexFullQuadNode} from "./vertexFullquadNode";
import {NodeInput} from "../graph/nodeInput";
import {NodeOutput} from "../graph/nodeOutput";

export class DrawRenderTargetToScreenNode extends DrawRenderNode {

    public static readonly SHADER_ID_VERTEX = "rendertarget2screen.vert"
    public static readonly SHADER_ID_FRAGMENT = "rendertarget2screen.frag"

    constructor(renderTargetId: string) {
        super({
            id: "drawnode.rendertarget2screen",
            input: [
                new NodeInput.ClearColor({
                    clearColor: [0, 0, 0, 1],
                }),
                new NodeInput.Shader({
                    vertexId: DrawRenderTargetToScreenNode.SHADER_ID_VERTEX,
                    fragmentId: DrawRenderTargetToScreenNode.SHADER_ID_FRAGMENT,
                }),
                new NodeInput.VertexDescriptor({
                    id: VertexFullQuadNode.DATA_ID,
                }),
                new NodeInput.RenderTarget({
                    renderTargetId: renderTargetId,
                    binding: "u_renderTarget",
                }),
            ],
            output: [
                new NodeOutput.Screen(),
            ],
        });
    }
}