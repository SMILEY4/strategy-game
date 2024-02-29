import {DrawRenderNode, DrawRenderNodeInput, DrawRenderNodeOutput} from "../../core/graph/drawRenderNode";
import {GLUniformType} from "../../../shared/webgl/glTypes";

export class DrawTilesOverlayNode extends DrawRenderNode {

    constructor(vpMatrixProvider: () => Float32Array) {
        super({
            id: "drawnode.tilesoverlay",
            input: [
                new DrawRenderNodeInput.ClearColor({
                    clearColor: [0, 0, 0, 0],
                }),
                new DrawRenderNodeInput.Shader({
                    vertexId: "overlay.vert",
                    fragmentId: "overlay.frag",
                }),
                new DrawRenderNodeInput.VertexData({
                    id: "vertexdata.overlay",
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
                    renderTargetId: "rendertarget.overlay",
                }),
            ],
        });
    }
}