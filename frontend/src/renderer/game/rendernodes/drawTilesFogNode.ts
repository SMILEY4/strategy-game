import {DrawRenderNode, DrawRenderNodeInput, DrawRenderNodeOutput} from "../../core/graph/drawRenderNode";

export class DrawTilesFogNode extends DrawRenderNode {

    constructor() {
        super({
            id: "drawnode.tilesfog",
            input: [
                new DrawRenderNodeInput.Texture({
                    path: "",
                    binding: "",
                }),
                new DrawRenderNodeInput.Shader({
                    vertexId: "",
                    fragmentId: "",
                }),
                new DrawRenderNodeInput.VertexData({
                    id: "vertexdata.water",
                }),
            ],
            output: [
                new DrawRenderNodeOutput.RenderTarget({
                    renderTargetId: "rendertarget.tileswater",
                }),
            ],
        });
    }
}