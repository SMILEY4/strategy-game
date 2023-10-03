import {WorldStore} from "../../../_old_external/state/world/worldStore";
import {GameStore} from "../../../_old_external/state/game/gameStore";
import {MapMode} from "../../models/mapMode";
import {TileLayerMeta} from "../../models/tileLayerMeta";
import {GameCanvasHandle} from "../gameCanvasHandle";
import {BatchRenderer} from "../utils/batchRenderer";
import {Camera} from "../utils/camera";
import {ShaderAttributeType, ShaderProgram, ShaderUniformType} from "../utils/shaderProgram";
import {ShaderSourceManager} from "../utils/shaderSourceManager";
import {TileVertexBuilder} from "./tileVertexBuilder";
import {Tile} from "../../models/tile";
import {CityCreationPreview} from "../../models/CityCreationPreview";
import {UserRepository} from "../../required/userRepository";
import {Country} from "../../models/country";
import {orDefault} from "../../../shared/utils";
import {Color} from "../../models/Color";
import colorToRgbArray = Color.colorToRgbArray;

export class TilemapRenderer {

    public static readonly SHADER_SRC_KEY_VERTEX = "tilemap.vertex";
    public static readonly SHADER_SRC_KEY_FRAGMENT = "tilemap.fragment";

    private readonly gameCanvas: GameCanvasHandle;
    private readonly shaderSourceManager: ShaderSourceManager;
    private readonly userRepository: UserRepository;
    private batchRenderer: BatchRenderer = null as any;
    private shader: ShaderProgram = null as any;
    private lastRevisionId: String = "";


    constructor(gameCanvas: GameCanvasHandle, shaderSourceManager: ShaderSourceManager, userRepository: UserRepository) {
        this.gameCanvas = gameCanvas;
        this.shaderSourceManager = shaderSourceManager;
        this.userRepository = userRepository;
    }


    public initialize() {
        this.batchRenderer = new BatchRenderer(this.gameCanvas.getGL(), 64000, true);
        this.shader = new ShaderProgram(this.gameCanvas.getGL(), {
            debugName: "tilemap",
            sourceVertex: this.shaderSourceManager.resolve(TilemapRenderer.SHADER_SRC_KEY_VERTEX),
            sourceFragment: this.shaderSourceManager.resolve(TilemapRenderer.SHADER_SRC_KEY_FRAGMENT),
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
                    amountComponents: 3,
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
                }),
            ],
            uniforms: [
                {
                    name: BatchRenderer.UNIFORM_VIEW_PROJECTION_MATRIX,
                    type: ShaderUniformType.MAT3,
                },
                {
                    name: "u_tileMouseOver",
                    type: ShaderUniformType.VEC2,
                },
                {
                    name: "u_tileSelected",
                    type: ShaderUniformType.VEC2,
                },
                {
                    name: "u_mapMode",
                    type: ShaderUniformType.INT,
                },
            ],
        });
    }


    public render(revisionId: string, camera: Camera, gameState: WorldStore.StateValues, localGameState: GameStore.StateValues) {


        if (this.lastRevisionId != revisionId || localGameState.previewCityCreation) {
            this.lastRevisionId = revisionId;

            const userId = this.userRepository.getUserId();
            const userCountry = gameState.countries.byUserId(userId);

            this.batchRenderer.begin();
            gameState.tiles.forEach(tile => {
                if (userCountry && localGameState.previewCityCreation && localGameState.previewCityCreation.claimedTiles.find(t => t.tileId == tile.tileId)) {
                    this.batchRenderer.add(
                        TileVertexBuilder.vertexData(this.buildPreviewTile(tile, userCountry, "?", localGameState.previewCityCreation)),
                        TileVertexBuilder.indexData(),
                    );
                } else {
                    this.batchRenderer.add(
                        TileVertexBuilder.vertexData(tile),
                        TileVertexBuilder.indexData(),
                    );
                }
            });

            this.batchRenderer.end(camera, this.shader, {
                uniforms: {
                    "u_tileMouseOver": localGameState.tileMouseOver ? [localGameState.tileMouseOver.q, localGameState.tileMouseOver.r] : [999999, 999999],
                    "u_tileSelected": localGameState.tileSelected ? [localGameState.tileSelected.q, localGameState.tileSelected.r] : [999999, 999999],
                    "u_mapMode": this.mapModeId(localGameState.mapMode),
                },
            });

        } else {
            this.batchRenderer.drawCache(camera, this.shader, {
                uniforms: {
                    "u_tileMouseOver": localGameState.tileMouseOver ? [localGameState.tileMouseOver.q, localGameState.tileMouseOver.r] : [999999, 999999],
                    "u_tileSelected": localGameState.tileSelected ? [localGameState.tileSelected.q, localGameState.tileSelected.r] : [999999, 999999],
                    "u_mapMode": this.mapModeId(localGameState.mapMode),
                },
            });
        }

    }

    private buildPreviewTile(tile: Tile, userCountry: Country, provinceId: string, preview: CityCreationPreview): Tile {
        if (tile.dataTier1) {
            return {
                ...tile,
                dataTier1: {
                    ...tile.dataTier1,
                    owner: {
                        countryId: userCountry.countryId,
                        provinceId: provinceId,
                        cityId: "?",
                    },
                },
                layers: [
                    {
                        layerId: TileLayerMeta.ID_COUNTRY,
                        value: colorToRgbArray(orDefault(userCountry.color, Color.INVALID)),
                        borderDirections: [true, true, true, true, true, true],
                    },
                    {
                        layerId: TileLayerMeta.ID_PROVINCE,
                        value: [0, 1, 1],
                        borderDirections: [true, true, true, true, true, true],
                    },
                    {
                        layerId: TileLayerMeta.ID_CITY,
                        value: [0, 1, 1],
                        borderDirections: [true, true, true, true, true, true],
                    },
                ],
            };
        } else {
            return tile;
        }
    }

    private mapModeId(mode: MapMode): number {
        if (mode === MapMode.DEFAULT) return 0;
        if (mode === MapMode.COUNTRIES) return 1;
        if (mode === MapMode.PROVINCES) return 2;
        if (mode === MapMode.CITIES) return 3;
        if (mode === MapMode.TERRAIN) return 4;
        if (mode === MapMode.RESOURCES) return 5;
        return 0;
    }


    public dispose() {
        this.shader.dispose();
    }

}