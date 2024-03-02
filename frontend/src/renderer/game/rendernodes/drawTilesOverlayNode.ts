import {DrawRenderNode} from "../../core/graph/drawRenderNode";
import {GLUniformType} from "../../../shared/webgl/glTypes";
import {NodeInput} from "../../core/graph/nodeInput";
import {NodeOutput} from "../../core/graph/nodeOutput";

export class DrawTilesOverlayNode extends DrawRenderNode {

    constructor(vpMatrixProvider: () => Float32Array) {
        super({
            id: "drawnode.tilesoverlay",
            input: [
                new NodeInput.ClearColor({
                    clearColor: [0, 0, 0, 0],
                }),
                new NodeInput.Shader({
                    vertexId: "overlay.vert",
                    fragmentId: "overlay.frag",
                }),
                new NodeInput.VertexDescriptor({
                    id: "vertexdata.overlay",
                }),
                new NodeInput.Property({
                    binding: "u_viewProjection",
                    type: GLUniformType.MAT3,
                    valueConstant: null,
                    valueProvider: vpMatrixProvider,
                })
            ],
            output: [
                new NodeOutput.RenderTarget({
                    renderTargetId: "rendertarget.overlay",
                }),
            ],
        });
    }
}