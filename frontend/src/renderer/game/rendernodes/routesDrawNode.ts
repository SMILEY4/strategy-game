import {DrawRenderNode} from "../../core/graph/drawRenderNode";
import {GLUniformType} from "../../../shared/webgl/glTypes";
import {NodeInput} from "../../core/graph/nodeInput";
import {NodeOutput} from "../../core/graph/nodeOutput";

export class RoutesDrawNode extends DrawRenderNode {

    constructor(vpMatrixProvider: () => Float32Array) {
        super({
            id: "drawnode.routes",
            input: [
                new NodeInput.ClearColor({
                    clearColor: [0, 0, 0, 0],
                }),
                new NodeInput.Shader({
                    vertexId: "routes.vert",
                    fragmentId: "routes.frag",
                }),
                new NodeInput.VertexDescriptor({
                    id: "vertexdata.routes",
                }),
                new NodeInput.Property({
                    binding: "u_viewProjection",
                    type: GLUniformType.MAT3,
                    valueConstant: null,
                    valueProvider: vpMatrixProvider,
                }),
            ],
            output: [
                new NodeOutput.RenderTarget({
                    renderTargetId: "rendertarget.routes",
                    depth: false,
                    scale: 2
                }),
            ],
        });
    }
}