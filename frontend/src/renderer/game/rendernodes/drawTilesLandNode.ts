import {DrawRenderNode, DrawRenderNodeInput, DrawRenderNodeOutput} from "../../core/graph/drawRenderNode";
import {GLUniformType} from "../../../shared/webgl/glTypes";

export class DrawTilesLandNode extends DrawRenderNode {

    constructor(vpMatrixProvider: () => Float32Array) {
        super({
            id: "drawnode.tilesland",
            input: [
                new DrawRenderNodeInput.ClearColor({
                    clearColor: [0, 0, 0, 0],
                }),
                new DrawRenderNodeInput.Texture({
                    path: "/groundSplotches.png",
                    binding: "u_texture",
                }),
                new DrawRenderNodeInput.Shader({
                    vertexId: "land.vert",
                    fragmentId: "land.frag",
                }),
                new DrawRenderNodeInput.VertexData({
                    id: "vertexdata.land",
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
                    renderTargetId: "rendertarget.tilesland",
                }),
            ],
        });
    }
}