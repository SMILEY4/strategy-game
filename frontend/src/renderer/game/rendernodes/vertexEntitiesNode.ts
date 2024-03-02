import {
    VertexBufferResource,
    VertexDataResource,
    VertexRenderNode,
} from "../../core/graph/vertexRenderNode";
import {GLAttributeType} from "../../../shared/webgl/glTypes";
import {TileDatabase} from "../../../state/tileDatabase";
import {MixedArrayBuffer, MixedArrayBufferCursor, MixedArrayBufferType} from "../../../shared/webgl/mixedArrayBuffer";
import {Tile} from "../../../models/tile";
import {TilemapUtils} from "../../../logic/game/tilemapUtils";
import {buildMap} from "../../../shared/utils";
import {CommandDatabase} from "../../../state/commandDatabase";
import {Command, DeleteMarkerCommand, PlaceMarkerCommand} from "../../../models/command";
import {CommandType} from "../../../models/commandType";
import {NodeOutput} from "../../core/graph/nodeOutput";
import VertexBuffer = NodeOutput.VertexBuffer;
import VertexDescriptor = NodeOutput.VertexDescriptor;

interface RenderEntity {
    q: number,
    r: number,
    type: "city" | "scout" | "marker"
}

export class VertexEntitiesNode extends VertexRenderNode {

    private static readonly PATTERN = [
        // vertex position
        ...MixedArrayBufferType.VEC2,
        // texture coords
        ...MixedArrayBufferType.VEC2,
    ];

    private readonly tileDb: TileDatabase;
    private readonly commandDb: CommandDatabase;

    constructor(tileDb: TileDatabase, commandDb: CommandDatabase) {
        super({
            id: "vertexnode.entities",
            input: [],
            output: [
                new VertexBuffer({
                    name: "vertexbuffer.entities",
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
                    ]
                }),
                new VertexDescriptor({
                    name: "vertexdata.entities",
                    type: "standart",
                    buffers: ["vertexbuffer.entities"]
                })
            ]
        });
        this.tileDb = tileDb;
        this.commandDb = commandDb;
    }

    public execute(): VertexDataResource {

        const commands = this.commandDb.queryMany(CommandDatabase.QUERY_ALL, null);
        const tiles = this.tileDb.queryMany(TileDatabase.QUERY_ALL, null);

        const renderEntities = this.collectEntities(tiles, commands);

        const [arrayBuffer, cursor] = MixedArrayBuffer.createWithCursor(renderEntities.length * 6, VertexEntitiesNode.PATTERN);
        for (let i = 0; i < renderEntities.length; i++) {
            this.appendEntity(renderEntities[i], cursor);
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

    private collectEntities(tiles: Tile[], commands: Command[]): RenderEntity[] {
        const entities: RenderEntity[] = [];

        const deletedMarkers = this.getDeletedMarkers(commands);

        for (let i = 0, n = tiles.length; i < n; i++) {
            const tile = tiles[i];
            if (tile.objects.visible) {
                for (let j = 0, m = tile.objects.value.length; j < m; j++) {
                    const obj = tile.objects.value[j];
                    if (obj.type === "city") {
                        entities.push({
                            q: tile.identifier.q,
                            r: tile.identifier.r,
                            type: "city",
                        });
                    }
                    if (obj.type === "scout") {
                        entities.push({
                            q: tile.identifier.q,
                            r: tile.identifier.r,
                            type: "scout",
                        });
                    }
                    if (obj.type === "marker" && !deletedMarkers.has(tile.identifier.id)) {
                        entities.push({
                            q: tile.identifier.q,
                            r: tile.identifier.r,
                            type: "marker",
                        });
                    }
                }
            }
        }

        for (let i = 0, n = commands.length; i < n; i++) {
            const command = commands[i];
            if (command.type === CommandType.MARKER_PLACE) {
                const cmd = command as PlaceMarkerCommand;
                entities.push({
                    q: cmd.tile.q,
                    r: cmd.tile.r,
                    type: "marker",
                });
            }
            if (command.type === CommandType.SCOUT_PLACE) {
                const cmd = command as PlaceMarkerCommand;
                entities.push({
                    q: cmd.tile.q,
                    r: cmd.tile.r,
                    type: "scout",
                });
            }
            if (command.type === CommandType.CITY_CREATE) {
                const cmd = command as PlaceMarkerCommand;
                entities.push({
                    q: cmd.tile.q,
                    r: cmd.tile.r,
                    type: "city",
                });
            }
        }

        return entities;
    }

    private getDeletedMarkers(commands: Command[]): Set<string> {
        const tileIds = new Set<string>();
        for (let i = 0; i < commands.length; i++) {
            const command = commands[i];
            if (command.type === CommandType.MARKER_DELETE) {
                tileIds.add((command as DeleteMarkerCommand).tile.id);
            }
        }
        return tileIds;
    }

    private appendEntity(entity: RenderEntity, cursor: MixedArrayBufferCursor) {

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

    private texU(entity: RenderEntity): [number, number] {
        const step = 1 / 8;
        if (entity.type === "city") {
            return [step * 4, step * 5];
        }
        if (entity.type === "scout") {
            return [step * 6, step * 7];
        }
        if (entity.type === "marker") {
            return [step * 7, step * 8];
        }
        return [0, 0];
    }

}