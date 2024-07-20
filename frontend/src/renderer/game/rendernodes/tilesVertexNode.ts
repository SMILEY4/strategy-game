import {VertexBufferResource, VertexDataResource, VertexRenderNode} from "../../core/graph/vertexRenderNode";
import {GLAttributeType} from "../../../shared/webgl/glTypes";
import {MixedArrayBuffer, MixedArrayBufferCursor, MixedArrayBufferType} from "../../../shared/webgl/mixedArrayBuffer";
import {TilemapUtils} from "../../../shared/tilemapUtils";
import {Tile} from "../../../models/tile";
import seedrandom from "seedrandom";
import {NodeOutput} from "../../core/graph/nodeOutput";
import {GameRenderConfig} from "../gameRenderConfig";
import {ChangeProvider} from "../changeProvider";
import VertexBuffer = NodeOutput.VertexBuffer;
import VertexDescriptor = NodeOutput.VertexDescriptor;
import {shuffleArray} from "../../../shared/utils";
import {RenderRepository} from "../RenderRepository";

export class TilesVertexNode extends VertexRenderNode {

    public static readonly ID = "vertexnode.tiles"

    private static readonly MESH_VERTEX_COUNT = 6 * 3;

    private static readonly MESH_PATTERN = [
        // vertex position
        ...MixedArrayBufferType.VEC2,
        // texture coords
        ...MixedArrayBufferType.VEC2,
        // corner data
        ...MixedArrayBufferType.VEC3,
        // direction data
        MixedArrayBufferType.INT,
    ];

    private static readonly WATER_PATTERN = [
        // world position (x,y)
        ...MixedArrayBufferType.VEC2,
        // depth
        MixedArrayBufferType.FLOAT,
        // packed water border mask
        MixedArrayBufferType.INT,
    ];

    private static readonly LAND_PATTERN = [
        // world position (x,y)
        ...MixedArrayBufferType.VEC2,
        // color (r,g,b,a)
        ...MixedArrayBufferType.VEC4,
    ];

    private static readonly FOG_PATTERN = [
        // world position (x,y)
        ...MixedArrayBufferType.VEC2,
        // visibility
        MixedArrayBufferType.INT
    ];

    private readonly changeProvider: ChangeProvider;
    private readonly repository: RenderRepository;
    private readonly renderConfig: () => GameRenderConfig;

    private tileIndices: number[] = [];


    constructor(changeProvider: ChangeProvider, renderConfig: () => GameRenderConfig, renderRepository: RenderRepository) {
        super({
            id: TilesVertexNode.ID,
            input: [],
            output: [
                new VertexBuffer({
                    name: "vertexbuffer.mesh.tile",
                    attributes: [
                        {
                            name: "in_vertexPosition",
                            type: GLAttributeType.FLOAT,
                            amountComponents: 2,
                        },
                        {
                            name: "in_textureCoordinates",
                            type: GLAttributeType.FLOAT,
                            amountComponents: 2,
                        },
                        {
                            name: "in_cornerData",
                            type: GLAttributeType.FLOAT,
                            amountComponents: 3,
                        },
                        {
                            name: "in_directionData",
                            type: GLAttributeType.INT,
                            amountComponents: 1,
                        },
                    ],
                }),
                new VertexBuffer({
                    name: "vertexbuffer.instance.tilewater",
                    attributes: [
                        {
                            name: "in_worldPosition",
                            type: GLAttributeType.FLOAT,
                            amountComponents: 2,
                            divisor: 1,
                        },
                        {
                            name: "in_depth",
                            type: GLAttributeType.FLOAT,
                            amountComponents: 1,
                            divisor: 1,
                        },
                        {
                            name: "in_borderMask",
                            type: GLAttributeType.INT,
                            amountComponents: 1,
                            divisor: 1,
                        },
                    ],
                }),
                new VertexBuffer({
                    name: "vertexbuffer.instance.tileland",
                    attributes: [
                        {
                            name: "in_worldPosition",
                            type: GLAttributeType.FLOAT,
                            amountComponents: 2,
                            divisor: 1,
                        },
                        {
                            name: "in_color",
                            type: GLAttributeType.FLOAT,
                            amountComponents: 3,
                            divisor: 1,
                        },
                    ],
                }),
                new VertexBuffer({
                    name: "vertexbuffer.instance.tilefog",
                    attributes: [
                        {
                            name: "in_worldPosition",
                            type: GLAttributeType.FLOAT,
                            amountComponents: 2,
                            divisor: 1,
                        },
                        {
                            name: "in_visibility",
                            type: GLAttributeType.INT,
                            amountComponents: 1,
                            divisor: 1,
                        },
                    ],
                }),
                new VertexDescriptor({
                    name: "vertexdata.water",
                    type: "instanced",
                    buffers: [
                        "vertexbuffer.mesh.tile",
                        "vertexbuffer.instance.tilewater",
                    ],
                }),
                new VertexDescriptor({
                    name: "vertexdata.land",
                    type: "instanced",
                    buffers: [
                        "vertexbuffer.mesh.tile",
                        "vertexbuffer.instance.tileland",
                    ],
                }),
                new VertexDescriptor({
                    name: "vertexdata.fog",
                    type: "instanced",
                    buffers: [
                        "vertexbuffer.mesh.tile",
                        "vertexbuffer.instance.tilefog",
                    ],
                }),
            ],
        });
        this.changeProvider = changeProvider;
        this.repository = renderRepository;
        this.renderConfig = renderConfig;
    }


    public execute(): VertexDataResource {
        const buffers = new Map<string, VertexBufferResource>();
        const outputs = new Map<string, { vertexCount: number; instanceCount: number }>();

        // base mesh + tile indices
        if (this.changeProvider.hasChange("basemesh")) {
            const [_, baseMeshData] = this.buildBaseMesh();
            buffers.set("vertexbuffer.mesh.tile", new VertexBufferResource(baseMeshData));
        }

        // tile instances
        if (this.changeProvider.hasChange(this.id)) {

            const tiles = this.repository.getTilesAll();
            const tileCounts = this.countTileTypes(tiles);

            if (this.tileIndices.length !== tiles.length) {
                this.tileIndices = this.buildTileIndices(tiles.length);
            }

            const [arrayBufferWater, cursorWater] = MixedArrayBuffer.createWithCursor(tileCounts.water, TilesVertexNode.WATER_PATTERN);
            const [arrayBufferLand, cursorLand] = MixedArrayBuffer.createWithCursor(tileCounts.land, TilesVertexNode.LAND_PATTERN);
            const [arrayBufferFog, cursorFog] = MixedArrayBuffer.createWithCursor(tileCounts.fog, TilesVertexNode.FOG_PATTERN);

            for (let i = 0, n = this.tileIndices.length; i < n; i++) {
                const index = this.tileIndices[i];
                const tile = tiles[index];
                if (this.isFog(tile)) {
                    this.appendFogInstance(tile, cursorFog);
                }
                if (this.isLand(tile)) {
                    this.appendLandInstance(tile, cursorLand);
                }
                if (this.isWater(tile)) {
                    this.appendWaterInstance(tile, cursorWater);
                }
            }

            buffers.set("vertexbuffer.instance.tilewater", new VertexBufferResource(arrayBufferWater.getRawBuffer()));
            buffers.set("vertexbuffer.instance.tileland", new VertexBufferResource(arrayBufferLand.getRawBuffer()));
            buffers.set("vertexbuffer.instance.tilefog", new VertexBufferResource(arrayBufferFog.getRawBuffer()));

            outputs.set("vertexdata.water", {
                vertexCount: TilesVertexNode.MESH_VERTEX_COUNT,
                instanceCount: tileCounts.water,
            });
            outputs.set("vertexdata.land", {
                vertexCount: TilesVertexNode.MESH_VERTEX_COUNT,
                instanceCount: tileCounts.land,
            });
            outputs.set("vertexdata.fog", {
                vertexCount: TilesVertexNode.MESH_VERTEX_COUNT,
                instanceCount: tileCounts.fog,
            });

        }

        return new VertexDataResource({
            buffers: buffers,
            outputs: outputs,
        });
    }

    private buildTileIndices(tileCount: number): number[] {
        const indices = [...Array(tileCount).keys()];
        shuffleArray(indices)
        return indices;
    }

    //===== BASE MESH ===============================================

    private buildBaseMesh(): [number, ArrayBuffer] {
        const [arrayBuffer, cursor] = MixedArrayBuffer.createWithCursor(TilesVertexNode.MESH_VERTEX_COUNT, TilesVertexNode.MESH_PATTERN);
        this.appendBaseMeshTriangle(cursor, 0, 1);
        this.appendBaseMeshTriangle(cursor, 1, 2);
        this.appendBaseMeshTriangle(cursor, 2, 3);
        this.appendBaseMeshTriangle(cursor, 3, 4);
        this.appendBaseMeshTriangle(cursor, 4, 5);
        this.appendBaseMeshTriangle(cursor, 5, 0);
        return [TilesVertexNode.MESH_VERTEX_COUNT, arrayBuffer.getRawBuffer()];
    }

    private appendBaseMeshTriangle(cursor: MixedArrayBufferCursor, cornerIndexA: number, cornerIndexB: number) {
        const scale = 1.44;
        // center
        cursor.append(0);
        cursor.append(0);
        cursor.append(this.hexTextureCoordinates(-1));
        cursor.append([1, 0, 0]);
        cursor.append(cornerIndexA);
        // corner a
        cursor.append(this.hexCornerPointX(cornerIndexA, TilemapUtils.DEFAULT_HEX_LAYOUT.size, scale));
        cursor.append(this.hexCornerPointY(cornerIndexA, TilemapUtils.DEFAULT_HEX_LAYOUT.size, scale));
        cursor.append(this.hexTextureCoordinates(cornerIndexA));
        cursor.append([0, 1, 0]);
        cursor.append(cornerIndexA);
        // corner b
        cursor.append(this.hexCornerPointX(cornerIndexB, TilemapUtils.DEFAULT_HEX_LAYOUT.size, scale));
        cursor.append(this.hexCornerPointY(cornerIndexB, TilemapUtils.DEFAULT_HEX_LAYOUT.size, scale));
        cursor.append(this.hexTextureCoordinates(cornerIndexB));
        cursor.append([0, 0, 1]);
        cursor.append(cornerIndexA);
    }

    //===== INSTANCES ===============================================

    private countTileTypes(tiles: Tile[]): { land: number, water: number, fog: number } {
        let countLand = 0;
        let countWater = 0;
        let countFog = 0;
        for (let i = 0, n = tiles.length; i < n; i++) {
            const tile = tiles[i];
            if (this.isFog(tile)) {
                countFog++;
            }
            if (this.isLand(tile)) {
                countLand++;
            }
            if (this.isWater(tile)) {
                countWater++;
            }
        }
        return {
            land: countLand,
            water: countWater,
            fog: countFog,
        };
    }


    //===== FOG INSTANCES ===========================================

    private isFog(tile: Tile): boolean {
        return false;
        // return tile.visibility === TileVisibility.UNKNOWN || tile.visibility === TileVisibility.DISCOVERED;
    }

    private appendFogInstance(tile: Tile, cursor: MixedArrayBufferCursor) {
        // const q = tile.identifier.q;
        // const r = tile.identifier.r;
        //
        // // world position
        // const center = TilemapUtils.hexToPixel(TilemapUtils.DEFAULT_HEX_LAYOUT, q, r);
        // cursor.append(center[0]);
        // cursor.append(center[1]);
        //
        // // visibility
        // cursor.append(tile.visibility.renderId)

    }

    //===== WATER INSTANCES =========================================

    private isWater(tile: Tile): boolean {
        return false
        // return tile.basic.terrainType.visible && tile.basic.terrainType.value === TerrainType.WATER;
    }

    private appendWaterInstance(tile: Tile, cursor: MixedArrayBufferCursor) {
        // const q = tile.identifier.q;
        // const r = tile.identifier.r;
        //
        // // world position
        // const center = TilemapUtils.hexToPixel(TilemapUtils.DEFAULT_HEX_LAYOUT, q, r);
        // cursor.append(center[0]);
        // cursor.append(center[1]);
        //
        // // color
        // const rng = seedrandom(tile.identifier.id).quick();
        // cursor.append(rng);
        //
        // // water border mask
        // const border = BorderBuilder.build(tile, this.gameRepository, false, (ta, tb) => {
        //     const a = getHiddenOrNull(ta.basic.terrainType);
        //     const b = getHiddenOrNull(tb.basic.terrainType);
        //     return (!a && !b) ? false : a === TerrainType.WATER && b !== null && a !== b;
        // });
        // const borderPacked = packBorder(border);
        // cursor.append(borderPacked);
    }

    //===== LAND INSTANCES ==========================================

    private isLand(tile: Tile): boolean {
        return true;
        // return tile.basic.terrainType.visible && tile.basic.terrainType.value !== TerrainType.WATER;
    }

    private appendLandInstance(tile: Tile, cursor: MixedArrayBufferCursor) {
        const q = tile.identifier.q;
        const r = tile.identifier.r;

        const rng = seedrandom(tile.identifier.id);

        // world position
        const center = TilemapUtils.hexToPixel(TilemapUtils.DEFAULT_HEX_LAYOUT, q, r);
        cursor.append(center[0]);
        cursor.append(center[1]);

        // color
        const color = this.mix(this.renderConfig().land.colorLight, this.renderConfig().land.colorDark, rng.quick());
        cursor.append(color);
    }


    //===== UTILITIES ===============================================

    private hexCornerPointX(cornerIndex: number, size: [number, number], scale: number): number {
        const angleDeg = 60 * cornerIndex - 30;
        const angleRad = Math.PI / 180 * angleDeg;
        return size[0] * Math.cos(angleRad) * scale;
    }

    private hexCornerPointY(cornerIndex: number, size: [number, number], scale: number): number {
        const angleDeg = 60 * cornerIndex - 30;
        const angleRad = Math.PI / 180 * angleDeg;
        return size[1] * Math.sin(angleRad) * scale;
    }

    private hexTextureCoordinates(cornerIndex: number): [number, number] {
        const xLeft = 0.065;
        const xCenter = 0.5;
        const xRight = 0.935;
        const yBottom = 0;
        const yCenterBottom = 0.25;
        const yCenter = 0.5;
        const yCenterTop = 0.75;
        const yTop = 1;
        switch (cornerIndex) {
            case -1:
                return [xCenter, yCenter];
            case 0:
                return [xRight, yCenterBottom];
            case 1:
                return [xRight, yCenterTop];
            case 2:
                return [xCenter, yTop];
            case 3:
                return [xLeft, yCenterTop];
            case 4:
                return [xLeft, yCenterBottom];
            case 5:
                return [xCenter, yBottom];
            default:
                return [0, 0];
        }
    }

    private mix(x: [number, number, number], y: [number, number, number], a: number): [number, number, number] {
        return [
            x[0] * (1 - a) + y[0] * a,
            x[1] * (1 - a) + y[1] * a,
            x[2] * (1 - a) + y[2] * a,
        ];
    }

}