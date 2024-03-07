import {DrawRenderNode} from "../../core/graph/drawRenderNode";
import {GLUniformType} from "../../../shared/webgl/glTypes";
import {NodeInput} from "../../core/graph/nodeInput";
import {NodeOutput} from "../../core/graph/nodeOutput";
import {GameSessionDatabase} from "../../../state/gameSessionDatabase";

export class DrawTilesOverlayNode extends DrawRenderNode {

    private readonly gameSessionDb: GameSessionDatabase;

    constructor(
        gameSessionDb: GameSessionDatabase,
        vpMatrixProvider: () => Float32Array
    ) {
        super({
            id: "drawnode.tilesoverlay",
            input: [
                new NodeInput.ClearColor({
                    clearColor: [0, 0, 0, 0],
                }),
                new NodeInput.Shader({
                    vertexId: "overlay.vert",
                    fragmentId: "overlay.frag",
                }),
                new NodeInput.VertexDescriptor({
                    id: "vertexdata.overlay",
                }),
                new NodeInput.Property({
                    binding: "u_viewProjection",
                    type: GLUniformType.MAT3,
                    valueConstant: null,
                    valueProvider: vpMatrixProvider,
                }),
                new NodeInput.Property({
                    binding: "u_tileMouseOver",
                    type: GLUniformType.INT_VEC2,
                    valueConstant: null,
                    valueProvider: () => {
                        const tile = this.gameSessionDb.getHoverTile();
                        if(tile){
                            return [tile.q, tile.r]
                        } else {
                            return [99999,99999]
                        }
                    },
                }),
                new NodeInput.Property({
                    binding: "u_tileSelected",
                    type: GLUniformType.INT_VEC2,
                    valueConstant: null,
                    valueProvider: () => {
                        const tile = this.gameSessionDb.getSelectedTile();
                        if(tile){
                            return [tile.q, tile.r]
                        } else {
                            return [99999,99999]
                        }
                    },
                })
            ],
            output: [
                new NodeOutput.RenderTarget({
                    renderTargetId: "rendertarget.overlay",
                    depth: false,
                    scale: 1
                }),
            ],
        });
        this.gameSessionDb = gameSessionDb;
    }
}