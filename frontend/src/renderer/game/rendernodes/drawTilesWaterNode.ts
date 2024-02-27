import {DrawRenderNode, DrawRenderNodeInput, DrawRenderNodeOutput} from "../../core/graph/drawRenderNode";
import {GLUniformType} from "../../../shared/webgl/glTypes";

export class DrawTilesWaterNode extends DrawRenderNode {

    constructor(vpMatrixProvider: () => Float32Array) {
        super({
            id: "drawnode.tileswater",
            input: [
                new DrawRenderNodeInput.Texture({
                    path: "/groundSplotches.png",
                    binding: "u_texture",
                }),
                new DrawRenderNodeInput.Shader({
                    vertexId: "water.vert",
                    fragmentId: "water.frag",
                }),
                new DrawRenderNodeInput.VertexData({
                    id: "vertexdata.water",
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
                    renderTargetId: "rendertarget.tileswater",
                }),
                // new DrawRenderNodeOutput.Screen()
            ],
        });
    }
}