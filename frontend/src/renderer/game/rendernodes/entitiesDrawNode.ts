import {DrawRenderNode} from "../../common/graph/drawRenderNode";
import {GLUniformType} from "../../../common/webgl/glTypes";
import {NodeOutput} from "../../common/graph/nodeOutput";
import {NodeInput} from "../../common/graph/nodeInput";

export class EntitiesDrawNode extends DrawRenderNode {

    public static readonly ID = "drawnode.entities"

    constructor(vpMatrixProvider: () => Float32Array) {
        super({
            id: EntitiesDrawNode.ID,
            input: [
                new NodeInput.ClearColor({
                    clearColor: [0, 0, 0, 0],
                }),
                new NodeInput.TextureAtlas({
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