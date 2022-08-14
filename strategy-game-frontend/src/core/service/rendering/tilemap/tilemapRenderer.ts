import {Country, CountryColor} from "../../../../models/state/country";
import {TerrainType} from "../../../../models/state/terrainType";
import {Tile} from "../../../../models/state/tile";
import {TilePosition} from "../../../../models/state/tilePosition";
import {GameCanvasHandle} from "../../gameCanvasHandle";
import {TilemapUtils} from "../../tilemap/tilemapUtils";
import {BatchRenderer} from "../utils/batchRenderer";
import {Camera} from "../utils/camera";
import {ShaderAttributeType, ShaderProgram, ShaderUniformType} from "../utils/shaderProgram";
import SRC_SHADER_FRAGMENT from "./mapShader.fsh?raw";
import SRC_SHADER_VERTEX from "./mapShader.vsh?raw";


export class TilemapRenderer {

    private readonly gameCanvas: GameCanvasHandle;
    private batchRenderer: BatchRenderer = null as any;
    private shader: ShaderProgram = null as any;


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
                    name: "in_position",
                    type: ShaderAttributeType.FLOAT,
                    amountComponents: 2,
                    offset: 0,
                    stride: 8
                },
                {
                    name: "in_tiledata",
                    type: ShaderAttributeType.FLOAT,
                    amountComponents: 3,
                    offset: 2,
                    stride: 8
                },
                {
                    name: "in_tilecolor",
                    type: ShaderAttributeType.FLOAT,
                    amountComponents: 3,
                    offset: 5,
                    stride: 8
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

    public render(camera: Camera, map: Tile[], tileMouseOver: TilePosition | null, tileSelected: TilePosition | null) {
        this.batchRenderer.begin(camera);
        map.forEach(tile => {
            const vertices = TilemapRenderer.buildVertexData(tile);
            const indices = TilemapRenderer.buildIndexData();
            this.batchRenderer.add(vertices, indices);
        });
        this.batchRenderer.end(this.shader, {
            attributes: ["in_position", "in_tiledata", "in_tilecolor"],
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


    /**
     * FORMAT: [x, y, q, r, tileId]
     */
    private static buildVertexData(tile: Tile): number[][] {
        const vertices: number[][] = [];
        const centerPos = TilemapUtils.hexToPixel(TilemapUtils.DEFAULT_HEX_LAYOUT, tile.position.q, tile.position.r);
        vertices.push([centerPos[0], centerPos[1], tile.position.q, tile.position.r, TilemapRenderer.terrainTypeToId(tile.terrainType), ...TilemapRenderer.tileColor(tile)]);
        for (let i = 0; i < 6; i++) {
            const vertex: number[] = [
                ...TilemapRenderer.hexCornerPoint(i, TilemapUtils.DEFAULT_HEX_LAYOUT.size, centerPos[0], centerPos[1]),
                tile.position.q, tile.position.r, TilemapRenderer.terrainTypeToId(tile.terrainType),
                ...TilemapRenderer.tileColor(tile)
            ];
            vertices.push(vertex);
            vertices.push(vertex);
        }
        return vertices;
    }

    private static tileColor(tile: Tile): [number, number, number,] {
        let maxInfluence: any = null;
        tile.influence.forEach(influence => {
            if (!maxInfluence || maxInfluence.value < influence.value) {
                maxInfluence = influence;
            }
        });
        if (maxInfluence && maxInfluence.value > 7) {
            const country = maxInfluence.country
            if (country) {
                if (country.color === CountryColor.RED) return [1, 0, 0];
                if (country.color === CountryColor.GREEN) return [0, 1, 0];
                if (country.color === CountryColor.BLUE) return [0, 0, 1];
                if (country.color === CountryColor.CYAN) return [0, 1, 1];
                if (country.color === CountryColor.MAGENTA) return [1, 0, 1];
                if (country.color === CountryColor.YELLOW) return [1, 1, 0];
            }
            return [1, 1, 1];
        } else {
            return [1, 1, 1];
        }

    }

    private static readonly HEX_INDEX_DATA = [
        0, 2, 3,
        0, 4, 5,
        0, 6, 7,
        0, 8, 9,
        0, 10, 11,
        0, 12, 1
    ];

    private static buildIndexData(): number[] {
        return TilemapRenderer.HEX_INDEX_DATA;
    }

    private static hexCornerPoint(i: number, size: [number, number], offX: number, offY: number) {
        const angleDeg = 60 * i - 30;
        const angleRad = Math.PI / 180 * angleDeg;
        return [
            size[0] * Math.cos(angleRad) + offX,
            size[1] * Math.sin(angleRad) + offY
        ];
    }

    private static terrainTypeToId(type: TerrainType): number {
        if (type == TerrainType.WATER) {
            return 0;
        }
        if (type == TerrainType.LAND) {
            return 1;
        }
        return -1;
    }


}