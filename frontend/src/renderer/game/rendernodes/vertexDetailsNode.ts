import {
    EMPTY_VERTEX_DATA_RESOURCE,
    VertexBufferResource,
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
import {NodeOutput} from "../../core/graph/nodeOutput";
import VertexBuffer = NodeOutput.VertexBuffer;
import VertexDescriptor = NodeOutput.VertexDescriptor;
import seedrandom from "seedrandom";
import {ChangeProvider} from "../changeProvider";

interface RenderDetail {
    tileId: string,
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

    private readonly tileDb: TileDatabase;
    private readonly changeProvider: ChangeProvider;

    constructor(changeProvider: ChangeProvider, tileDb: TileDatabase) {
        super({
            id: "vertexnode.details",
            input: [],
            output: [
                new VertexBuffer({
                    name: "vertexbuffer.details",
                    attributes: [
                        {
                            name: "in_worldPosition",
                            type: GLAttributeType.FLOAT,
                            amountComponents: 2,
                        },
                        {
                            name: "in_textureCoordinates",
                            type: GLAttributeType.FLOAT,
                            amountComponents: 2,
                        },
                    ],
                }),
                new VertexDescriptor({
                    name: "vertexdata.details",
                    type: "standart",
                    buffers: ["vertexbuffer.details"],
                }),
            ],
        });
        this.changeProvider = changeProvider;
        this.tileDb = tileDb;
    }

    public execute(): VertexDataResource {
        if(!this.changeProvider.hasChange(this.id)) {
            return EMPTY_VERTEX_DATA_RESOURCE;
        }

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
                    tileId: tile.identifier.id,
                    q: tile.identifier.q,
                    r: tile.identifier.r,
                    type: "mountain",
                });
            }
            if (tile.basic.resourceType.visible && tile.basic.resourceType.value === TerrainResourceType.FOREST) {
                details.push({
                    tileId: tile.identifier.id,
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

        const rng = seedrandom(entity.tileId);
        const cx = center[0] + (rng.quick() * 2 - 1) * TilemapUtils.DEFAULT_HEX_LAYOUT.size[0] * 0.2;
        const cy = center[1] + (rng.quick() * 2 - 1) * TilemapUtils.DEFAULT_HEX_LAYOUT.size[1] * 0.2;

        // triangle a
        this.appendVertex(cx - halfSize, cy - halfSize, texU[0], 0, cursor);
        this.appendVertex(cx + halfSize, cy - halfSize, texU[1], 0, cursor);
        this.appendVertex(cx + halfSize, cy + halfSize, texU[1], 1, cursor);

        // triangle b
        this.appendVertex(cx - halfSize, cy - halfSize, texU[0], 0, cursor);
        this.appendVertex(cx - halfSize, cy + halfSize, texU[0], 1, cursor);
        this.appendVertex(cx + halfSize, cy + halfSize, texU[1], 1, cursor);
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