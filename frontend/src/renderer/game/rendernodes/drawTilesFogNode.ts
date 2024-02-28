import {DrawRenderNode, DrawRenderNodeInput, DrawRenderNodeOutput} from "../../core/graph/drawRenderNode";
import {GLUniformType} from "../../../shared/webgl/glTypes";

export class DrawTilesFogNode extends DrawRenderNode {

    constructor(vpMatrixProvider: () => Float32Array) {
        super({
            id: "drawnode.tilesfog",
            input: [
                new DrawRenderNodeInput.Texture({
                    path: "/groundSplotches.png",
                    binding: "u_texture",
                }),
                new DrawRenderNodeInput.Shader({
                    vertexId: "fog.vert",
                    fragmentId: "fog.frag",
                }),
                new DrawRenderNodeInput.VertexData({
                    id: "vertexdata.fog",
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
                    renderTargetId: "rendertarget.tilesfog",
                }),
            ],
        });
    }
}