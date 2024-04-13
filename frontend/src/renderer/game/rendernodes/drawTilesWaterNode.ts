import {DrawRenderNode} from "../../core/graph/drawRenderNode";
import {GLUniformType} from "../../../shared/webgl/glTypes";
import {NodeInput} from "../../core/graph/nodeInput";
import {NodeOutput} from "../../core/graph/nodeOutput";


export class DrawTilesWaterNode extends DrawRenderNode {

    constructor(vpMatrixProvider: () => Float32Array) {
        super({
            id: "drawnode.tileswater",
            input: [
                new NodeInput.ClearColor({
                    clearColor: [0, 0, 0, 0],
                }),
                new NodeInput.Texture({
                    path: "/textures/groundSplotches.png",
                    binding: "u_texture",
                }),
                new NodeInput.Shader({
                    vertexId: "water.vert",
                    fragmentId: "water.frag",
                }),
                new NodeInput.VertexDescriptor({
                    id: "vertexdata.water",
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
                    renderTargetId: "rendertarget.tileswater",
                    depth: false,
                    scale: 1
                }),
            ],
        });
    }
}