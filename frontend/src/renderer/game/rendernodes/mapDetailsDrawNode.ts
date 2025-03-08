import {DrawRenderNode} from "../../common/graph/drawRenderNode";
import {GLUniformType} from "../../../common/webgl/glTypes";
import {NodeOutput} from "../../common/graph/nodeOutput";
import {NodeInput} from "../../common/graph/nodeInput";
import {GameWebGLRenderContext} from "../gameRenderContext";

export class MapDetailsDrawNode extends DrawRenderNode<GameWebGLRenderContext> {

    public static readonly ID = "drawnode.mapdetails"

    constructor() {
        super({
            id: MapDetailsDrawNode.ID,
            input: [
                new NodeInput.ClearColor({
                    clearColor: [0, 0, 0, 0],
                }),
                new NodeInput.Texture({
                    path: "/tileset_outline.png",
                    binding: "u_textureOutline",
                }),
                new NodeInput.TextureAtlas({
                    path: "/tileset_color.png",
                    binding: "u_textureColor",
                }),
                new NodeInput.Texture({
                    path: "/tileset_mask.png",
                    binding: "u_textureMask",
                }),
                new NodeInput.Shader({
                    vertexId: "mapdetails.vert",
                    fragmentId: "mapdetails.frag",
                }),
                new NodeInput.VertexDescriptor({
                    id: "vertexdata.mapdetails",
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
                    renderTargetId: "rendertarget.mapdetails",
                    depth: true,
                    scale: 2
                }),
            ],
        });
    }
}