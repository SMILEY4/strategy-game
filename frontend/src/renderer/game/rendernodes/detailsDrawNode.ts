import {DrawRenderNode} from "../../core/graph/drawRenderNode";
import {GLUniformType} from "../../../shared/webgl/glTypes";
import {NodeOutput} from "../../core/graph/nodeOutput";
import {NodeInput} from "../../core/graph/nodeInput";

export class DetailsDrawNode extends DrawRenderNode {

    public static readonly ID = "drawnode.details"

    constructor(vpMatrixProvider: () => Float32Array) {
        super({
            id: DetailsDrawNode.ID,
            input: [
                new NodeInput.ClearColor({
                    clearColor: [0, 0, 0, 0],
                }),
                new NodeInput.Texture({
                    path: "/icons/tileset.png",
                    binding: "u_texture",
                }),
                new NodeInput.Shader({
                    vertexId: "details.vert",
                    fragmentId: "details.frag",
                }),
                new NodeInput.VertexDescriptor({
                    id: "vertexdata.details",
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
                    renderTargetId: "rendertarget.details",
                    depth: false,
                    scale: 2
                }),
            ],
        });
    }
}