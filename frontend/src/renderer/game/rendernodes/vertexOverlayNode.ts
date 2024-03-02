import {VertexBufferResource, VertexDataResource, VertexRenderNode} from "../../core/graph/vertexRenderNode";
import {GLAttributeType} from "../../../shared/webgl/glTypes";
import {MixedArrayBuffer, MixedArrayBufferCursor, MixedArrayBufferType} from "../../../shared/webgl/mixedArrayBuffer";
import {TilemapUtils} from "../../../logic/game/tilemapUtils";
import {TileDatabase} from "../../../state/tileDatabase";
import {Tile} from "../../../models/tile";
import {BorderBuilder} from "../../../logic/game/borderBuilder";
import {packBorder} from "../../../rendererV1/data/builders/tilemap/packBorder";
import {MapMode} from "../../../models/mapMode";
import {GameSessionDatabase} from "../../../state/gameSessionDatabase";
import {NodeOutput} from "../../core/graph/nodeOutput";
import {ChangeProvider} from "../changeProvider";
import VertexBuffer = NodeOutput.VertexBuffer;
import VertexDescriptor = NodeOutput.VertexDescriptor;

export class VertexOverlayNode extends VertexRenderNode {

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

    private static readonly INSTANCE_PATTERN = [
        // world position (x,y)
        ...MixedArrayBufferType.VEC2,
        // border mask
        MixedArrayBufferType.INT,
        // border color
        ...MixedArrayBufferType.VEC4,
        // fill color
        ...MixedArrayBufferType.VEC4,
    ];

    private readonly changeProvider: ChangeProvider;
    private readonly tileDb: TileDatabase;
    private readonly gameSessionDb: GameSessionDatabase;

    constructor(changeProvider: ChangeProvider, tileDb: TileDatabase, gameSessionDb: GameSessionDatabase) {
        super({
            id: "vertexnode.overlay",
            input: [],
            output: [
                new VertexBuffer({
                    name: "vertexbuffer.mesh.overlay",
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
                    name: "vertexbuffer.instance.overlay",
                    attributes: [
                        {
                            name: "in_worldPosition",
                            type: GLAttributeType.FLOAT,
                            amountComponents: 2,
                            divisor: 1,
                        },
                        {
                            name: "in_borderMask",
                            type: GLAttributeType.INT,
                            amountComponents: 1,
                            divisor: 1,
                        },
                        {
                            name: "in_borderColor",
                            type: GLAttributeType.FLOAT,
                            amountComponents: 4,
                            divisor: 1,
                        },
                        {
                            name: "in_fillColor",
                            type: GLAttributeType.FLOAT,
                            amountComponents: 4,
                            divisor: 1,
                        },
                    ],
                }),
                new VertexDescriptor({
                    name: "vertexdata.overlay",
                    type: "instanced",
                    buffers: [
                        "vertexbuffer.mesh.overlay",
                        "vertexbuffer.instance.overlay",
                    ],
                }),
            ],
        });
        this.changeProvider = changeProvider;
        this.tileDb = tileDb;
        this.gameSessionDb = gameSessionDb;
    }

    public execute(): VertexDataResource {

        const buffers = new Map<string, VertexBufferResource>();
        const outputs = new Map<string, { vertexCount: number; instanceCount: number }>();

        // base mesh
        if (this.changeProvider.hasChange("basemesh")) {
            const [_, baseMeshData] = this.buildBaseMesh();
            buffers.set("vertexbuffer.mesh.overlay", new VertexBufferResource(baseMeshData));
        }

        if (this.changeProvider.hasChange(this.id + ".instances")) {

            // tile instances
            const tiles = this.tileDb.queryMany(TileDatabase.QUERY_ALL, null);
            const tileCounts = this.countTiles(tiles);

            const [arrayBufferOverlay, cursorOverlay] = MixedArrayBuffer.createWithCursor(tileCounts, VertexOverlayNode.INSTANCE_PATTERN);

            const mapMode = this.gameSessionDb.getMapMode();
            const mapModeContext = mapMode.renderData.context(tiles);

            for (let i = 0, n = tiles.length; i < n; i++) {
                const tile = tiles[i];
                if (tile.basic.terrainType.visible) {
                    this.appendOverlayInstance(tile, mapMode, mapModeContext, cursorOverlay);
                }
            }

            buffers.set("vertexbuffer.instance.overlay", new VertexBufferResource(arrayBufferOverlay.getRawBuffer()));
            outputs.set("vertexdata.overlay", {
                vertexCount: VertexOverlayNode.MESH_VERTEX_COUNT,
                instanceCount: tileCounts,
            });

        }

        return new VertexDataResource({
            buffers: buffers,
            outputs: outputs,
        });
    }

    //===== BASE MESH ===============================================

    private buildBaseMesh(): [number, ArrayBuffer] {
        const [arrayBuffer, cursor] = MixedArrayBuffer.createWithCursor(VertexOverlayNode.MESH_VERTEX_COUNT, VertexOverlayNode.MESH_PATTERN);
        this.appendBaseMeshTriangle(cursor, 0, 1);
        this.appendBaseMeshTriangle(cursor, 1, 2);
        this.appendBaseMeshTriangle(cursor, 2, 3);
        this.appendBaseMeshTriangle(cursor, 3, 4);
        this.appendBaseMeshTriangle(cursor, 4, 5);
        this.appendBaseMeshTriangle(cursor, 5, 0);
        return [VertexOverlayNode.MESH_VERTEX_COUNT, arrayBuffer.getRawBuffer()];
    }

    private appendBaseMeshTriangle(cursor: MixedArrayBufferCursor, cornerIndexA: number, cornerIndexB: number) {
        // center
        cursor.append(0);
        cursor.append(0);
        cursor.append(this.hexTextureCoordinates(-1));
        cursor.append([1, 0, 0]);
        cursor.append(cornerIndexA);
        // corner a
        cursor.append(this.hexCornerPointX(cornerIndexA, TilemapUtils.DEFAULT_HEX_LAYOUT.size, 1));
        cursor.append(this.hexCornerPointY(cornerIndexA, TilemapUtils.DEFAULT_HEX_LAYOUT.size, 1));
        cursor.append(this.hexTextureCoordinates(cornerIndexA));
        cursor.append([0, 1, 0]);
        cursor.append(cornerIndexA);
        // corner b
        cursor.append(this.hexCornerPointX(cornerIndexB, TilemapUtils.DEFAULT_HEX_LAYOUT.size, 1));
        cursor.append(this.hexCornerPointY(cornerIndexB, TilemapUtils.DEFAULT_HEX_LAYOUT.size, 1));
        cursor.append(this.hexTextureCoordinates(cornerIndexB));
        cursor.append([0, 0, 1]);
        cursor.append(cornerIndexA);
    }

    //===== INSTANCES ===============================================

    private countTiles(tiles: Tile[]): number {
        let count = 0;
        for (let i = 0, n = tiles.length; i < n; i++) {
            const tile = tiles[i];
            if (tile.basic.terrainType.visible) {
                count++;
            }
        }
        return count;
    }

    private appendOverlayInstance(tile: Tile, mapMode: MapMode, mapModeContext: any, cursor: MixedArrayBufferCursor) {
        const q = tile.identifier.q;
        const r = tile.identifier.r;

        // world position
        const center = TilemapUtils.hexToPixel(TilemapUtils.DEFAULT_HEX_LAYOUT, q, r);
        cursor.append(center[0]);
        cursor.append(center[1]);

        // border mask
        const borderData = BorderBuilder.build(tile, this.tileDb, mapMode.renderData.borderDefault, mapMode.renderData.borderCheck);
        const borderPacked = packBorder(borderData);
        cursor.append(borderPacked);

        // border color
        cursor.append(mapMode.renderData.borderColor(tile, mapModeContext));

        // fill color
        cursor.append(mapMode.renderData.fillColor(tile, mapModeContext));
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

}