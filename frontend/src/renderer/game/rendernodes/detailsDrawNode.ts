import {DrawRenderNode} from "../../common/graph/drawRenderNode";
import {GLUniformType} from "../../../common/webgl/glTypes";
import {NodeOutput} from "../../common/graph/nodeOutput";
import {NodeInput} from "../../common/graph/nodeInput";
import {GameWebGLRenderContext} from "../gameWebGLRenderContext";

export class DetailsDrawNode extends DrawRenderNode<GameWebGLRenderContext> {

    public static readonly ID = "drawnode.details"

    constructor() {
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
                    valueProvider: context => context.camera.getViewProjectionMatrixOrThrow(),
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