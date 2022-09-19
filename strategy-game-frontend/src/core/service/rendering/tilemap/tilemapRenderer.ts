import {GameStore} from "../../../../external/state/game/gameStore";
import {LocalGameStore} from "../../../../external/state/localgame/localGameStore";
import {MapMode} from "../../../../models/state/mapMode";
import {TileLayerMeta} from "../../../../models/state/tileLayerMeta";
import {GameCanvasHandle} from "../../gameCanvasHandle";
import {BaseRenderer} from "../utils/baseRenderer";
import {BatchRenderer} from "../utils/batchRenderer";
import {Camera} from "../utils/camera";
import {ShaderAttributeType, ShaderProgram, ShaderUniformType} from "../utils/shaderProgram";
import SRC_SHADER_FRAGMENT from "./mapShader.fsh?raw";
import SRC_SHADER_VERTEX from "./mapShader.vsh?raw";
import {TileVertexBuilder} from "./tileVertexBuilder";

export class TilemapRenderer {

    private readonly gameCanvas: GameCanvasHandle;
    private batchRenderer: BatchRenderer = null as any;
    private shader: ShaderProgram = null as any;
    private baseRenderer: BaseRenderer = null as any;
    private lastRevisionId: String = "";


    constructor(gameCanvas: GameCanvasHandle) {
        this.gameCanvas = gameCanvas;
    }


    public initialize() {
        this.baseRenderer = new BaseRenderer(this.gameCanvas.getGL());
        this.batchRenderer = new BatchRenderer(this.gameCanvas.getGL(), 64000, true);
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
                    name: "in_cornerData",
                    type: ShaderAttributeType.FLOAT,
                    amountComponents: 3,
                },
                {
                    name: "in_terrainData",
                    type: ShaderAttributeType.FLOAT,
                    amountComponents: 2,
                },
                ...TileLayerMeta.TILE_LAYERS.flatMap(layerMeta => {
                    return [
                        {
                            name: "in_layer_values_" + layerMeta.layerId,
                            type: ShaderAttributeType.FLOAT,
                            amountComponents: layerMeta.amountValues,
                        },
                        {
                            name: "in_layer_borders_" + layerMeta.layerId,
                            type: ShaderAttributeType.FLOAT,
                            amountComponents: 3,
                        },
                    ];
                })
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
                },
                {
                    name: "u_mapMode",
                    type: ShaderUniformType.INT
                }
            ]
        });
    }


    public render(revisionId: string, camera: Camera, gameState: GameStore.StateValues, localGameState: LocalGameStore.StateValues) {

        if (this.lastRevisionId != revisionId) {
            this.lastRevisionId = revisionId;

            this.batchRenderer.begin();
            gameState.tiles.forEach(tile => {
                this.batchRenderer.add(
                    TileVertexBuilder.vertexData(tile, gameState.countries),
                    TileVertexBuilder.indexData()
                );
            });

            this.batchRenderer.end(camera, this.shader, {
                uniforms: {
                    "u_tileMouseOver": localGameState.tileMouseOver ? [localGameState.tileMouseOver.q, localGameState.tileMouseOver.r] : [999999, 999999],
                    "u_tileSelected": localGameState.tileSelected ? [localGameState.tileSelected.q, localGameState.tileSelected.r] : [999999, 999999],
                    "u_mapMode": this.mapModeId(localGameState.mapMode)
                }
            });

        } else {
            this.batchRenderer.drawCache(camera, this.shader, {
                uniforms: {
                    "u_tileMouseOver": localGameState.tileMouseOver ? [localGameState.tileMouseOver.q, localGameState.tileMouseOver.r] : [999999, 999999],
                    "u_tileSelected": localGameState.tileSelected ? [localGameState.tileSelected.q, localGameState.tileSelected.r] : [999999, 999999],
                    "u_mapMode": this.mapModeId(localGameState.mapMode)
                }
            });
        }

    }


    private mapModeId(mode: MapMode): number {
        if (mode === MapMode.DEFAULT) return 0;
        if (mode === MapMode.COUNTRIES) return 1;
        if (mode === MapMode.PROVINCES) return 2;
        if (mode === MapMode.CITIES) return 3;
        if (mode === MapMode.TERRAIN) return 4;
        return 0;
    }


    public dispose() {
        this.shader.dispose();
    }

}