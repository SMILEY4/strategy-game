import {GameStore} from "../../../../external/state/game/gameStore";
import {LocalGameStore} from "../../../../external/state/localgame/localGameStore";
import {GameCanvasHandle} from "../../gameCanvasHandle";
import {BatchRenderer} from "../utils/batchRenderer";
import {Camera} from "../utils/camera";
import {ShaderAttributeType, ShaderProgram, ShaderUniformType} from "../utils/shaderProgram";
import SRC_SHADER_FRAGMENT from "./mapShader.fsh?raw";
import SRC_SHADER_VERTEX from "./mapShader.vsh?raw";
import {TileVertexBuilder} from "./tileVertexBuilder";


interface TilemapCache {
    revisionId: string,
    tileData: ({
        vertices: number[][],
        indices: number[]
    })[]
}

export class TilemapRenderer {

    private readonly gameCanvas: GameCanvasHandle;
    private batchRenderer: BatchRenderer = null as any;
    private shader: ShaderProgram = null as any;

    private cache: TilemapCache = {
        revisionId: "",
        tileData: []
    };


    constructor(gameCanvas: GameCanvasHandle) {
        this.gameCanvas = gameCanvas;
    }

    public initialize() {
        this.batchRenderer = new BatchRenderer(this.gameCanvas.getGL());
        this.shader = new ShaderProgram(this.gameCanvas.getGL(), {
            debugName: "tilemap",
            sourceVertex: SRC_SHADER_VERTEX,
            sourceFragment: SRC_SHADER_FRAGMENT,
            attributes: [
                {
                    name: "in_worldPosition",
                    type: ShaderAttributeType.FLOAT,
                    amountComponents: 2,
                },
                {
                    name: "in_tilePosition",
                    type: ShaderAttributeType.FLOAT,
                    amountComponents: 2,
                },
                {
                    name: "in_terrainData",
                    type: ShaderAttributeType.FLOAT,
                    amountComponents: 1,
                },
                {
                    name: "in_overlayColor",
                    type: ShaderAttributeType.FLOAT,
                    amountComponents: 4,
                },
                {
                    name: "in_cornerData",
                    type: ShaderAttributeType.FLOAT,
                    amountComponents: 3,
                },
                {
                    name: "in_borderData",
                    type: ShaderAttributeType.FLOAT,
                    amountComponents: 3,
                }
            ],
            uniforms: [
                {
                    name: BatchRenderer.UNIFORM_VIEW_PROJECTION_MATRIX,
                    type: ShaderUniformType.MAT3
                },
                {
                    name: "u_tileMouseOver",
                    type: ShaderUniformType.VEC2
                },
                {
                    name: "u_tileSelected",
                    type: ShaderUniformType.VEC2
                }
            ]
        });
    }

    public render(revisionId: string, camera: Camera, gameState: GameStore.StateValues, localGameState: LocalGameStore.StateValues) {

        if (this.cache.revisionId != revisionId) {
            this.cache.revisionId = revisionId;
            this.cache.tileData = [];
            gameState.tiles.forEach(tile => {
                this.cache.tileData.push({
                    vertices: TileVertexBuilder.vertexData(tile, gameState.countries),
                    indices: TileVertexBuilder.indexData()
                });
            });
        }

        this.batchRenderer.begin(camera);
        this.cache.tileData.forEach(tile => {
            this.batchRenderer.add(tile.vertices, tile.indices)
        })
        this.batchRenderer.end(this.shader, {
            uniforms: {
                "u_tileMouseOver": localGameState.tileMouseOver ? [localGameState.tileMouseOver.q, localGameState.tileMouseOver.r] : [999999, 999999],
                "u_tileSelected": localGameState.tileSelected ? [localGameState.tileSelected.q, localGameState.tileSelected.r] : [999999, 999999],
            }
        });
    }

    public dispose() {
        this.batchRenderer.dispose();
        this.shader.dispose();
    }

}