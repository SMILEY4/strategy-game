import {Tile} from "../../../../models/state/tile";
import {TilePosition} from "../../../../models/state/tilePosition";
import {GameCanvasHandle} from "../../gameCanvasHandle";
import {BatchRenderer} from "../utils/batchRenderer";
import {Camera} from "../utils/camera";
import {ShaderAttributeType, ShaderProgram, ShaderUniformType} from "../utils/shaderProgram";
import SRC_SHADER_FRAGMENT from "./mapShader.fsh?raw";
import SRC_SHADER_VERTEX from "./mapShader.vsh?raw";
import {TileVertexBuilder} from "./TileVertexBuilder";


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
                    offset: 0,
                    stride: 15
                },
                {
                    name: "in_tilePosition",
                    type: ShaderAttributeType.FLOAT,
                    amountComponents: 2,
                    offset: 2,
                    stride: 15
                },
                {
                    name: "in_terrainData",
                    type: ShaderAttributeType.FLOAT,
                    amountComponents: 1,
                    offset: 4,
                    stride: 15
                },
                {
                    name: "in_overlayColor",
                    type: ShaderAttributeType.FLOAT,
                    amountComponents: 4,
                    offset: 5,
                    stride: 15
                },
                {
                    name: "in_cornerData",
                    type: ShaderAttributeType.FLOAT,
                    amountComponents: 3,
                    offset: 9,
                    stride: 15
                },
                {
                    name: "in_borderData",
                    type: ShaderAttributeType.FLOAT,
                    amountComponents: 3,
                    offset: 12,
                    stride: 15
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

    public render(revisionId: string, camera: Camera, map: Tile[], tileMouseOver: TilePosition | null, tileSelected: TilePosition | null) {

        if (this.cache.revisionId != revisionId) {
            this.cache.revisionId = revisionId;
            this.cache.tileData = [];
            map.forEach(tile => {
                this.cache.tileData.push({
                    vertices: TileVertexBuilder.vertexData(tile),
                    indices: TileVertexBuilder.indexData()
                });
            });
        }

        this.batchRenderer.begin(camera);
        this.cache.tileData.forEach(tile => {
            this.batchRenderer.add(tile.vertices, tile.indices)
        })
        this.batchRenderer.end(this.shader, {
            attributes: [
                "in_worldPosition",
                "in_tilePosition",
                "in_terrainData",
                "in_overlayColor",
                "in_cornerData",
                "in_borderData",
            ],
            uniforms: {
                "u_tileMouseOver": tileMouseOver ? [tileMouseOver.q, tileMouseOver.r] : [999999, 999999],
                "u_tileSelected": tileSelected ? [tileSelected.q, tileSelected.r] : [999999, 999999],
            }
        });
    }

    public dispose() {
        this.batchRenderer.dispose();
        this.shader.dispose();
    }

}