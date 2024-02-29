import {
    VertexBufferResource, VertexDataAttributeConfig,
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

interface RenderEntity {
    q: number,
    r: number,
    type: "mountain" | "forest" | "city" | "scout" | "marker"
}

// todo: rename entities -> details here, i.e. "VertexDetailsNode" ??
export class VertexEntitiesNode extends VertexRenderNode {

    private static readonly PATTERN = [
        // vertex position
        ...MixedArrayBufferType.VEC2,
        // texture coords
        ...MixedArrayBufferType.VEC2,
    ];

    private static readonly ATTRIBUTES: VertexDataAttributeConfig[] = [
        {
            origin: "vertexbuffer.entities",
            name: "in_worldPosition",
            type: GLAttributeType.FLOAT,
            amountComponents: 2,
        },
        {
            origin: "vertexbuffer.entities",
            name: "in_textureCoordinates",
            type: GLAttributeType.FLOAT,
            amountComponents: 2,
        }
    ]

    private readonly tileDb: TileDatabase;

    constructor(tileDb: TileDatabase) {
        super({
            id: "vertexnode.entities",
            outputData: [
                {
                    id: "vertexdata.entities",
                    type: "basic",
                    attributes: VertexEntitiesNode.ATTRIBUTES,
                },
            ]
        });
        this.tileDb = tileDb;
    }

    public execute(): VertexDataResource {

        const tiles = this.tileDb.queryMany(TileDatabase.QUERY_ALL, null);
        const renderEntities = this.collectEntities(tiles)

        const [arrayBuffer, cursor] = MixedArrayBuffer.createWithCursor(renderEntities.length * 6, VertexEntitiesNode.PATTERN);
        for (let i = 0; i < renderEntities.length; i++) {
            this.appendEntity(renderEntities[i], cursor)
        }


        return new VertexDataResource({
            buffers: buildMap({
                "vertexbuffer.entities": new VertexBufferResource(arrayBuffer.getRawBuffer()),
            }),
            outputs: buildMap({
                "vertexdata.entities": {
                    vertexCount: renderEntities.length * 6,
                    instanceCount: 0,
                },
            }),
        });
    }

    private collectEntities(tiles: Tile[]): RenderEntity[] {
        const entities: RenderEntity[] =[]

        for(let i=0, n=tiles.length; i<n; i++) {
            const tile = tiles[i];
            if(tile.basic.terrainType.visible && tile.basic.terrainType.value === TerrainType.MOUNTAIN) {
               entities.push({
                   q: tile.identifier.q,
                   r: tile.identifier.r,
                   type: "mountain"
               })
            }
            if(tile.basic.resourceType.visible && tile.basic.resourceType.value === TerrainResourceType.FOREST) {
                entities.push({
                    q: tile.identifier.q,
                    r: tile.identifier.r,
                    type: "forest"
                })
            }
            if(tile.objects.visible) {
                for (let j=0, m=tile.objects.value.length; j < m; j++) {
                    const obj = tile.objects.value[j];
                    if(obj.type === "city") {
                        entities.push({
                            q: tile.identifier.q,
                            r: tile.identifier.r,
                            type: "city"
                        })
                    }
                    if(obj.type === "scout") {
                        entities.push({
                            q: tile.identifier.q,
                            r: tile.identifier.r,
                            type: "scout"
                        })
                    }
                    if(obj.type === "marker") {
                        entities.push({
                            q: tile.identifier.q,
                            r: tile.identifier.r,
                            type: "marker"
                        })
                    }
                }
            }
        }

        return entities
    }

    private appendEntity(entity: RenderEntity, cursor: MixedArrayBufferCursor) {

        const center = TilemapUtils.hexToPixel(TilemapUtils.DEFAULT_HEX_LAYOUT, entity.q, entity.r);
        const halfSize = TilemapUtils.DEFAULT_HEX_LAYOUT.size[0] * 1.15
        const texU = this.texU(entity)


        // triangle a
        this.appendVertex(center[0] - halfSize, center[1] - halfSize, texU[0], 0, cursor)
        this.appendVertex(center[0] + halfSize, center[1] - halfSize, texU[1], 0, cursor)
        this.appendVertex(center[0] + halfSize, center[1] + halfSize, texU[1], 1, cursor)

        // triangle b
        this.appendVertex(center[0] - halfSize, center[1] - halfSize, texU[0], 0, cursor)
        this.appendVertex(center[0] - halfSize, center[1] + halfSize, texU[0], 1, cursor)
        this.appendVertex(center[0] + halfSize, center[1] + halfSize, texU[1], 1, cursor)
    }

    private appendVertex(x: number, y: number, u: number, v: number, cursor: MixedArrayBufferCursor) {

        // world position
        cursor.append(x)
        cursor.append(y)

        // texture coordinates
        cursor.append(u)
        cursor.append(v)
    }

    private texU(entity: RenderEntity): [number, number] {
        const step = 1/8;
        if(entity.type === "mountain") {
            return [0, step];
        }
        if(entity.type === "forest") {
            return [step, step*2];
        }
        if(entity.type === "city") {
            return [step*4, step*5];
        }
        if(entity.type === "scout") {
            return [step*6, step*7];
        }
        if(entity.type === "marker") {
            return [step*7, step*8];
        }

        return [0, 0];
    }


}