import {DrawRenderNode, DrawRenderNodeInput, DrawRenderNodeOutput} from "../../core/graph/drawRenderNode";
import {GLUniformType} from "../../../shared/webgl/glTypes";

export class DrawRoutesNode extends DrawRenderNode {

    constructor(vpMatrixProvider: () => Float32Array) {
        super({
            id: "drawnode.routes",
            input: [
                new DrawRenderNodeInput.ClearColor({
                    clearColor: [0, 0, 0, 0],
                }),
                new DrawRenderNodeInput.Shader({
                    vertexId: "routes.vert",
                    fragmentId: "routes.frag",
                }),
                new DrawRenderNodeInput.VertexData({
                    id: "vertexdata.routes",
                }),
                new DrawRenderNodeInput.Property({
                    binding: "u_viewProjection",
                    type: GLUniformType.MAT3,
                    valueConstant: null,
                    valueProvider: vpMatrixProvider,
                }),
            ],
            output: [
                new DrawRenderNodeOutput.RenderTarget({
                    renderTargetId: "rendertarget.routes",
                }),
            ],
        });
    }
}