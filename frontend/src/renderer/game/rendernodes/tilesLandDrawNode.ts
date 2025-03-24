import {GLUniformType} from "../../../common/webgl/glTypes";
import {DrawRenderNode} from "../../common/graph/nodes/drawRenderNode";
import {NodeInput} from "../../common/graph/nodes/nodeInput";
import {NodeOutput} from "../../common/graph/nodes/nodeOutput";
import {GameWebGLRenderContext} from "../gameRenderContext";

export class TilesLandDrawNode extends DrawRenderNode<GameWebGLRenderContext> {

    public static readonly ID = "drawnode.tilesland"

    constructor() {
        super({
            id: TilesLandDrawNode.ID,
            input: [
                new NodeInput.ClearColor({
                    clearColor: [0, 0, 0, 0],
                }),
                new NodeInput.Texture({
                    path: "/textures/groundSplotches.png",
                    binding: "u_texture",
                }),
                new NodeInput.Shader({
                    vertexId: "land.vert",
                    fragmentId: "land.frag",
                }),
                new NodeInput.VertexDescriptor({
                    id: "vertexdata.land",
                }),
                new NodeInput.Property({
                    binding: "u_viewProjection",
                    type: GLUniformType.MAT3,
                    valueConstant: null,
                    valueProvider: context => context.camera.getViewProjectionMatrixOrThrow(),
                })
            ],
            output: [
                new NodeOutput.RenderTarget({
                    renderTargetId: "rendertarget.tilesland",
                    depth: false,
                    scale: 1
                }),
            ],
        });
    }
}