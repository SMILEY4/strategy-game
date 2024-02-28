import {DrawRenderNode, DrawRenderNodeInput, DrawRenderNodeOutput} from "../../core/graph/drawRenderNode";
import {GLUniformType} from "../../../shared/webgl/glTypes";

export class DrawEntitiesNode extends DrawRenderNode {

    constructor(vpMatrixProvider: () => Float32Array) {
        super({
            id: "drawnode.entities",
            input: [
                new DrawRenderNodeInput.ClearColor({
                    clearColor: [0, 0, 0, 0],
                }),
                new DrawRenderNodeInput.Texture({
                    path: "/tilesetNew.png",
                    binding: "u_texture",
                }),
                new DrawRenderNodeInput.Shader({
                    vertexId: "entities.vert",
                    fragmentId: "entities.frag",
                }),
                new DrawRenderNodeInput.VertexData({
                    id: "vertexdata.entities",
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
                    renderTargetId: "rendertarget.entities",
                }),
            ],
        });
    }
}