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
                //==== OVERLAY =======================================
                new NodeInput.Property({
                    binding: "u_overlay.borderThickness",
                    type: GLUniformType.FLOAT,
                    valueConstant: 0.15
                }),
                new NodeInput.Property({
                    binding: "u_overlay.borderOpacity",
                    type: GLUniformType.FLOAT,
                    valueConstant: 1.0
                }),
                new NodeInput.Property({
                    binding: "u_overlay.fillOpacity",
                    type: GLUniformType.FLOAT,
                    valueConstant: 0.7
                }),
                //==== MOUSE OVER ====================================
                new NodeInput.Property({
                    binding: "u_tileMouseOver.position",
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
                    binding: "u_tileMouseOver.thickness",
                    type: GLUniformType.FLOAT,
                    valueConstant: 0.08
                }),
                new NodeInput.Property({
                    binding: "u_tileMouseOver.color",
                    type: GLUniformType.VEC4,
                    valueConstant: [0.729, 0.184, 0.420, 1.0]
                }),
                //==== TILE SELECTION ================================
                new NodeInput.Property({
                    binding: "u_tileSelection.position",
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
                }),
                new NodeInput.Property({
                    binding: "u_tileSelection.thickness",
                    type: GLUniformType.FLOAT,
                    valueConstant: 0.15
                }),
                new NodeInput.Property({
                    binding: "u_tileSelection.color",
                    type: GLUniformType.VEC4,
                    valueConstant: [0.741, 0.090, 0.251, 1.0]
                }),
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