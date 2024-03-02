import {
    VertexBufferResource,
    VertexDataAttributeConfig,
    VertexDataResource,
    VertexRenderNode,
} from "../../core/graph/vertexRenderNode";
import {GLAttributeType} from "../../../shared/webgl/glTypes";
import {TileDatabase} from "../../../state/tileDatabase";
import {MixedArrayBuffer, MixedArrayBufferCursor, MixedArrayBufferType} from "../../../shared/webgl/mixedArrayBuffer";
import {Tile} from "../../../models/tile";
import {TerrainType} from "../../../models/terrainType";
import {TerrainResourceType} from "../../../models/terrainResourceType";
import {TilemapUtils} from "../../../logic/game/tilemapUtils";
import {buildMap} from "../../../shared/utils";

interface RenderDetail {
    q: number,
    r: number,
    type: "mountain" | "forest"
}

export class VertexDetailsNode extends VertexRenderNode {

    private static readonly PATTERN = [
        // vertex position
        ...MixedArrayBufferType.VEC2,
        // texture coords
        ...MixedArrayBufferType.VEC2,
    ];

    private static readonly ATTRIBUTES: VertexDataAttributeConfig[] = [
        {
            origin: "vertexbuffer.details",
            name: "in_worldPosition",
            type: GLAttributeType.FLOAT,
            amountComponents: 2,
        },
        {
            origin: "vertexbuffer.details",
            name: "in_textureCoordinates",
            type: GLAttributeType.FLOAT,
            amountComponents: 2,
        },
    ];

    private readonly tileDb: TileDatabase;

    constructor(tileDb: TileDatabase) {
        super({
            id: "vertexnode.details",
            outputData: [
                {
                    id: "vertexdata.details",
                    type: "basic",
                    attributes: VertexDetailsNode.ATTRIBUTES,
                },
            ],
        });
        this.tileDb = tileDb;
    }

    public execute(): VertexDataResource {

        const tiles = this.tileDb.queryMany(TileDatabase.QUERY_ALL, null);
        const renderDetails = this.collectDetails(tiles);

        const [arrayBuffer, cursor] = MixedArrayBuffer.createWithCursor(renderDetails.length * 6, VertexDetailsNode.PATTERN);
        for (let i = 0; i < renderDetails.length; i++) {
            this.appendDetail(renderDetails[i], cursor);
        }


        return new VertexDataResource({
            buffers: buildMap({
                "vertexbuffer.details": new VertexBufferResource(arrayBuffer.getRawBuffer()),
            }),
            outputs: buildMap({
                "vertexdata.details": {
                    vertexCount: renderDetails.length * 6,
                    instanceCount: 0,
                },
            }),
        });
    }

    private collectDetails(tiles: Tile[]): RenderDetail[] {
        const details: RenderDetail[] = [];

        for (let i = 0, n = tiles.length; i < n; i++) {
            const tile = tiles[i];
            if (tile.basic.terrainType.visible && tile.basic.terrainType.value === TerrainType.MOUNTAIN) {
                details.push({
                    q: tile.identifier.q,
                    r: tile.identifier.r,
                    type: "mountain",
                });
            }
            if (tile.basic.resourceType.visible && tile.basic.resourceType.value === TerrainResourceType.FOREST) {
                details.push({
                    q: tile.identifier.q,
                    r: tile.identifier.r,
                    type: "forest",
                });
            }
        }
        return details;
    }

    private appendDetail(entity: RenderDetail, cursor: MixedArrayBufferCursor) {

        const center = TilemapUtils.hexToPixel(TilemapUtils.DEFAULT_HEX_LAYOUT, entity.q, entity.r);
        const halfSize = TilemapUtils.DEFAULT_HEX_LAYOUT.size[0] * 1.15;
        const texU = this.texU(entity);


        // triangle a
        this.appendVertex(center[0] - halfSize, center[1] - halfSize, texU[0], 0, cursor);
        this.appendVertex(center[0] + halfSize, center[1] - halfSize, texU[1], 0, cursor);
        this.appendVertex(center[0] + halfSize, center[1] + halfSize, texU[1], 1, cursor);

        // triangle b
        this.appendVertex(center[0] - halfSize, center[1] - halfSize, texU[0], 0, cursor);
        this.appendVertex(center[0] - halfSize, center[1] + halfSize, texU[0], 1, cursor);
        this.appendVertex(center[0] + halfSize, center[1] + halfSize, texU[1], 1, cursor);
    }

    private appendVertex(x: number, y: number, u: number, v: number, cursor: MixedArrayBufferCursor) {

        // world position
        cursor.append(x);
        cursor.append(y);

        // texture coordinates
        cursor.append(u);
        cursor.append(v);
    }

    private texU(entity: RenderDetail): [number, number] {
        const step = 1 / 8;
        if (entity.type === "mountain") {
            return [0, step];
        }
        if (entity.type === "forest") {
            return [step, step * 2];
        }
        return [0, 0];
    }


}