import {DrawRenderNode, DrawRenderNodeInput, DrawRenderNodeOutput} from "../graph/drawRenderNode";
import {VertexFullQuadNode} from "./vertexFullquadNode";

export class DrawRenderTargetToScreenNode extends DrawRenderNode {

    public static readonly SHADER_ID_VERTEX = "rendertarget2screen.vert"
    public static readonly SHADER_ID_FRAGMENT = "rendertarget2screen.frag"

    constructor(renderTargetId: string) {
        super({
            id: "drawnode.rendertarget2screen",
            input: [
                new DrawRenderNodeInput.Shader({
                    vertexId: DrawRenderTargetToScreenNode.SHADER_ID_VERTEX,
                    fragmentId: DrawRenderTargetToScreenNode.SHADER_ID_FRAGMENT,
                }),
                new DrawRenderNodeInput.VertexData({
                    id: VertexFullQuadNode.DATA_ID,
                }),
                new DrawRenderNodeInput.RenderTarget({
                    renderTargetId: renderTargetId,
                    binding: "u_renderTarget",
                }),
            ],
            output: [
                new DrawRenderNodeOutput.Screen(),
            ],
        });
    }
}