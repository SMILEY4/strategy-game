import {DrawRenderNode, DrawRenderNodeInput, DrawRenderNodeOutput} from "../../core/graph/drawRenderNode";
import {GLUniformType} from "../../../shared/webgl/glTypes";

export class DrawDetailsNode extends DrawRenderNode {

    constructor(vpMatrixProvider: () => Float32Array) {
        super({
            id: "drawnode.details",
            input: [
                new DrawRenderNodeInput.ClearColor({
                    clearColor: [0, 0, 0, 0],
                }),
                new DrawRenderNodeInput.Texture({
                    path: "/tilesetNew.png",
                    binding: "u_texture",
                }),
                new DrawRenderNodeInput.Shader({
                    vertexId: "details.vert",
                    fragmentId: "details.frag",
                }),
                new DrawRenderNodeInput.VertexData({
                    id: "vertexdata.details",
                }),
                new DrawRenderNodeInput.Property({
                    binding: "u_viewProjection",
                    type: GLUniformType.MAT3,
                    valueConstant: null,
                    valueProvider: vpMatrixProvider,
                })
            ],
            output: [
                new DrawRenderNodeOutput.RenderTarget({
                    renderTargetId: "rendertarget.details",
                }),
            ],
        });
    }
}