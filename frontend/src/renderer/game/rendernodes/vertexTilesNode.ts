import {
    VertexBufferResource,
    VertexDataAttributeConfig,
    VertexDataResource,
    VertexRenderNode,
} from "../../core/graph/vertexRenderNode";
import {GLAttributeType} from "../../../shared/webgl/glTypes";
import {MixedArrayBuffer, MixedArrayBufferCursor, MixedArrayBufferType} from "../../../shared/webgl/mixedArrayBuffer";
import {TilemapUtils} from "../../../logic/game/tilemapUtils";
import {TileDatabase} from "../../../state/tileDatabase";
import {Tile} from "../../../models/tile";
import {TerrainType} from "../../../models/terrainType";
import {BorderBuilder} from "../../../logic/game/borderBuilder";
import {getHiddenOrNull} from "../../../models/hiddenType";
import {TileVisibility} from "../../../models/tileVisibility";
import {packBorder} from "../../../rendererV1/data/builders/tilemap/packBorder";

export class VertexTilesNode extends VertexRenderNode {

    private static readonly COLOR_LAND_LIGHT: [number, number, number] = [0.561, 0.557, 0.345];
    private static readonly COLOR_LAND_DARK: [number, number, number] = [0.447, 0.459, 0.341];

    private static readonly COLOR_FOW_LIGHT: [number, number, number] = [0.1, 0.1, 0.1];
    private static readonly COLOR_FOW_DARK: [number, number, number] = [0.09, 0.09, 0.09];


    //==== BASE MESH ================================================

    private static readonly MESH_VERTEX_COUNT = 6 * 3;

    private static readonly MESH_PATTERN = [
        // vertex position
        ...MixedArrayBufferType.VEC2,
        // texture coords
        ...MixedArrayBufferType.VEC2,
    ];

    private static readonly MESH_ATTRIBUTES: VertexDataAttributeConfig[] = [
        {
            origin: "vertexbuffer.mesh.tile",
            name: "in_vertexPosition",
            type: GLAttributeType.FLOAT,
            amountComponents: 2,
        },
        {
            origin: "vertexbuffer.mesh.tile",
            name: "in_textureCoordinates",
            type: GLAttributeType.FLOAT,
            amountComponents: 2,
        },
    ];


    //===== LAND INSTANCES ==========================================

    private static readonly LAND_PATTERN = [
        // world position (x,y)
        ...MixedArrayBufferType.VEC2,
        // color (r,g,b,a)
        ...MixedArrayBufferType.VEC4,
    ];

    private static readonly LAND_ATTRIBUTES: VertexDataAttributeConfig[] = [
        {
            origin: "vertexbuffer.instance.tileland",
            name: "in_worldPosition",
            type: GLAttributeType.FLOAT,
            amountComponents: 2,
            divisor: 1,
        },
        {
            origin: "vertexbuffer.instance.tileland",
            name: "in_color",
            type: GLAttributeType.FLOAT,
            amountComponents: 4,
            divisor: 1,
        },
    ];

    //===== WATER INSTANCES =========================================

    private static readonly WATER_PATTERN = [
        // world position (x,y)
        ...MixedArrayBufferType.VEC2,
        // packed water border mask
        MixedArrayBufferType.INT,
    ];

    private static readonly WATER_ATTRIBUTES: VertexDataAttributeConfig[] = [
        {
            origin: "vertexbuffer.instance.tilewater",
            name: "in_worldPosition",
            type: GLAttributeType.FLOAT,
            amountComponents: 2,
            divisor: 1,
        },
        {
            origin: "vertexbuffer.instance.tilewater",
            name: "in_borderMask",
            type: GLAttributeType.INT,
            amountComponents: 1,
            divisor: 1,
        },
    ];

    //===== FOG INSTANCES ===========================================

    private static readonly FOG_PATTERN = [
        // world position (x,y)
        ...MixedArrayBufferType.VEC2,
        // color (r,g,b,a)
        ...MixedArrayBufferType.VEC4,
    ];

    private static readonly FOG_ATTRIBUTES: VertexDataAttributeConfig[] = [
        {
            origin: "vertexbuffer.instance.tilefog",
            name: "in_worldPosition",
            type: GLAttributeType.FLOAT,
            amountComponents: 2,
            divisor: 1,
        },
        {
            origin: "vertexbuffer.instance.tilefog",
            name: "in_color",
            type: GLAttributeType.FLOAT,
            amountComponents: 4,
            divisor: 1,
        },
    ];

    private readonly tileDb: TileDatabase;
    private initializedBaseMesh: boolean = false;

    constructor(tileDb: TileDatabase) {
        super({
            id: "vertexnode.tiles",
            outputData: [
                {
                    id: "vertexdata.water",
                    type: "instanced",
                    attributes: [
                        ...VertexTilesNode.MESH_ATTRIBUTES,
                        ...VertexTilesNode.WATER_ATTRIBUTES,
                    ],
                },
                {
                    id: "vertexdata.land",
                    type: "instanced",
                    attributes: [
                        ...VertexTilesNode.MESH_ATTRIBUTES,
                        ...VertexTilesNode.LAND_ATTRIBUTES,
                    ],
                },
                {
                    id: "vertexdata.fog",
                    type: "instanced",
                    attributes: [
                        ...VertexTilesNode.MESH_ATTRIBUTES,
                        ...VertexTilesNode.FOG_ATTRIBUTES,
                    ],
                },
            ],
        });
        this.tileDb = tileDb;
    }

    public execute(): VertexDataResource {

        const buffers = new Map<string, VertexBufferResource>();
        const outputs = new Map<string, { vertexCount: number; instanceCount: number }>();

        // base mesh
        if (!this.initializedBaseMesh) {
            const [_, baseMeshData] = this.buildBaseMesh();
            buffers.set("vertexbuffer.mesh.tile", new VertexBufferResource(baseMeshData));
            this.initializedBaseMesh = true;
        }

        // tile instances
        const tiles = this.tileDb.queryMany(TileDatabase.QUERY_ALL, null);
        const tileCounts = this.countTileTypes(tiles);

        const [arrayBufferWater, cursorWater] = MixedArrayBuffer.createWithCursor(tileCounts.water, VertexTilesNode.WATER_PATTERN);
        const [arrayBufferLand, cursorLand] = MixedArrayBuffer.createWithCursor(tileCounts.land, VertexTilesNode.LAND_PATTERN);
        const [arrayBufferFog, cursorFog] = MixedArrayBuffer.createWithCursor(tileCounts.fog, VertexTilesNode.FOG_PATTERN);

        for (let i = 0, n = tiles.length; i < n; i++) {
            const tile = tiles[i];
            if (this.isFog(tile)) {
                this.appendFogInstance(tile, cursorFog)
            } else if (this.isLand(tile)) {
                this.appendLandInstance(tile, cursorLand)
            } else if (this.isWater(tile)) {
                this.appendWaterInstance(tile, cursorWater)
            }
        }

        buffers.set("vertexbuffer.instance.tilewater", new VertexBufferResource(arrayBufferWater.getRawBuffer()))
        buffers.set("vertexbuffer.instance.tileland", new VertexBufferResource(arrayBufferLand.getRawBuffer()))
        buffers.set("vertexbuffer.instance.tilefog", new VertexBufferResource(arrayBufferFog.getRawBuffer()))

        outputs.set("vertexdata.water", { vertexCount: VertexTilesNode.MESH_VERTEX_COUNT, instanceCount: tileCounts.water})
        outputs.set("vertexdata.land", { vertexCount: VertexTilesNode.MESH_VERTEX_COUNT, instanceCount: tileCounts.land})
        outputs.set("vertexdata.fog", { vertexCount: VertexTilesNode.MESH_VERTEX_COUNT, instanceCount: tileCounts.fog})

        return new VertexDataResource({
            buffers: buffers,
            outputs: outputs,
        });
    }

    //===== BASE MESH ===============================================


    private buildBaseMesh(): [number, ArrayBuffer] {
        const [arrayBuffer, cursor] = MixedArrayBuffer.createWithCursor(VertexTilesNode.MESH_VERTEX_COUNT, VertexTilesNode.MESH_PATTERN);
        this.appendBaseMeshTriangle(cursor, 0, 1);
        this.appendBaseMeshTriangle(cursor, 1, 2);
        this.appendBaseMeshTriangle(cursor, 2, 3);
        this.appendBaseMeshTriangle(cursor, 3, 4);
        this.appendBaseMeshTriangle(cursor, 4, 5);
        this.appendBaseMeshTriangle(cursor, 5, 0);
        return [VertexTilesNode.MESH_VERTEX_COUNT, arrayBuffer.getRawBuffer()];
    }

    private appendBaseMeshTriangle(cursor: MixedArrayBufferCursor, cornerIndexA: number, cornerIndexB: number) {
        const scale = 1.44;
        // center
        cursor.append(0);
        cursor.append(0);
        cursor.append(this.hexTextureCoordinates(-1));
        // corner a
        cursor.append(this.hexCornerPointX(cornerIndexA, TilemapUtils.DEFAULT_HEX_LAYOUT.size, scale));
        cursor.append(this.hexCornerPointY(cornerIndexA, TilemapUtils.DEFAULT_HEX_LAYOUT.size, scale));
        cursor.append(this.hexTextureCoordinates(cornerIndexA));
        // corner b
        cursor.append(this.hexCornerPointX(cornerIndexB, TilemapUtils.DEFAULT_HEX_LAYOUT.size, scale));
        cursor.append(this.hexCornerPointY(cornerIndexB, TilemapUtils.DEFAULT_HEX_LAYOUT.size, scale));
        cursor.append(this.hexTextureCoordinates(cornerIndexB));
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
            } else if (this.isLand(tile)) {
                countLand++;
            } else if (this.isWater(tile)) {
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
        return !tile.basic.terrainType.visible;
    }

    private appendFogInstance(tile: Tile, cursor: MixedArrayBufferCursor) {
        const q = tile.identifier.q;
        const r = tile.identifier.r;

        // world position
        const center = TilemapUtils.hexToPixel(TilemapUtils.DEFAULT_HEX_LAYOUT, q, r);
        cursor.append(center[0]);
        cursor.append(center[1]);

        // ground color
        let color = [...this.mix(VertexTilesNode.COLOR_FOW_LIGHT, VertexTilesNode.COLOR_FOW_DARK, Math.random()), 1];
        cursor.append(color[0]);
        cursor.append(color[1]);
        cursor.append(color[2]);
        cursor.append(color[3]);
    }

    //===== WATER INSTANCES =========================================

    private isWater(tile: Tile): boolean {
        return tile.basic.terrainType.visible && tile.basic.terrainType.value === TerrainType.WATER;
    }

    private appendWaterInstance(tile: Tile, cursor: MixedArrayBufferCursor) {
        const q = tile.identifier.q;
        const r = tile.identifier.r;

        // world position
        const center = TilemapUtils.hexToPixel(TilemapUtils.DEFAULT_HEX_LAYOUT, q, r);
        cursor.append(center[0]);
        cursor.append(center[1]);

        // water border mask
        const border = BorderBuilder.build(tile, this.tileDb, false, (ta, tb) => {
            const a = getHiddenOrNull(ta.basic.terrainType);
            const b = getHiddenOrNull(tb.basic.terrainType);
            return (!a && !b) ? false : a === TerrainType.WATER && b !== null && a !== b;
        });
        const borderPacked = packBorder(border);
        cursor.append(borderPacked);
    }

    //===== LAND INSTANCES ==========================================

    private isLand(tile: Tile): boolean {
        return tile.basic.terrainType.visible && tile.basic.terrainType.value !== TerrainType.WATER;
    }

    private appendLandInstance(tile: Tile, cursor: MixedArrayBufferCursor) {
        const q = tile.identifier.q;
        const r = tile.identifier.r;

        // world position
        const center = TilemapUtils.hexToPixel(TilemapUtils.DEFAULT_HEX_LAYOUT, q, r);
        cursor.append(center[0]);
        cursor.append(center[1]);

        // ground color
        let color = [...this.mix(VertexTilesNode.COLOR_LAND_LIGHT, VertexTilesNode.COLOR_LAND_DARK, Math.random()), 1];
        cursor.append(color[0]);
        cursor.append(color[1]);
        cursor.append(color[2]);
        cursor.append(color[3]);
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