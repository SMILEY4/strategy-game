import {DrawRenderNode} from "../../common/graph/drawRenderNode";
import {GLUniformType} from "../../../common/webgl/glTypes";
import {NodeInput} from "../../common/graph/nodeInput";
import {NodeOutput} from "../../common/graph/nodeOutput";
import {GameWebGLRenderContext} from "../gameRenderContext";

export class RoutesDrawNode extends DrawRenderNode<GameWebGLRenderContext> {

    public static readonly ID = "drawnode.routes"

    constructor() {
        super({
            id: RoutesDrawNode.ID,
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
                    valueProvider: context => context.camera.getViewProjectionMatrixOrThrow(),
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