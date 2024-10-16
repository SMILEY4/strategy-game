import {DrawRenderNode} from "../../core/graph/drawRenderNode";
import {GLUniformType} from "../../../shared/webgl/glTypes";
import {NodeOutput} from "../../core/graph/nodeOutput";
import {NodeInput} from "../../core/graph/nodeInput";

export class EntitiesDrawNode extends DrawRenderNode {

    public static readonly ID = "drawnode.entities"

    constructor(vpMatrixProvider: () => Float32Array) {
        super({
            id: EntitiesDrawNode.ID,
            input: [
                new NodeInput.ClearColor({
                    clearColor: [0, 0, 0, 0],
                }),
                new NodeInput.Texture({
                    path: "/icons/tileset.png",
                    binding: "u_texture",
                }),
                new NodeInput.Shader({
                    vertexId: "entities.vert",
                    fragmentId: "entities.frag",
                }),
                new NodeInput.VertexDescriptor({
                    id: "vertexdata.entities",
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
                    renderTargetId: "rendertarget.entities",
                    depth: false,
                    scale: 2
                }),
            ],
        });
    }
}