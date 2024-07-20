import {GLUniformType} from "../../../shared/webgl/glTypes";
import {DrawRenderNode} from "../../core/graph/drawRenderNode";
import {NodeInput} from "../../core/graph/nodeInput";
import {NodeOutput} from "../../core/graph/nodeOutput";

export class TilesLandDrawNode extends DrawRenderNode {

    public static readonly ID = "drawnode.tilesland"

    constructor(vpMatrixProvider: () => Float32Array) {
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
                    valueProvider: vpMatrixProvider,
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