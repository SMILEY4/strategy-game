// noinspection PointlessArithmeticExpressionJS

import {Tile, TileIdentifier} from "../../../../models/tile";
import {City} from "../../../../models/city";
import {Country, CountryIdentifier} from "../../../../models/country";
import {MixedArrayBuffer, MixedArrayBufferCursor, MixedArrayBufferType} from "../../common/mixedArrayBuffer";
import {TilemapUtils} from "../../../../_old_core/tilemap/tilemapUtils";
import {MeshData} from "../data/meshData";
import {GLAttributeType} from "../../common/glTypes";
import {GLProgram} from "../../common/glProgram";
import {Command, CreateSettlementCommand, PlaceScoutCommand} from "../../../../models/command";
import {match} from "../../../../shared/match";
import GLProgramAttribute = GLProgram.GLProgramAttribute;

export namespace EntityDataBuilder {

    const PATTERN_INDEX = [
        MixedArrayBufferType.U_SHORT,
    ];

    const PATTERN_VERTEX = [
        MixedArrayBufferType.FLOAT,
        MixedArrayBufferType.FLOAT,
        MixedArrayBufferType.FLOAT,
        MixedArrayBufferType.FLOAT,
    ];

    const INDICES_PER_ENTITY = 6;
    const VERTICES_PER_ENTITY = 4;
    const VALUES_PER_VERTEX = PATTERN_VERTEX.length;


    interface RenderEntity {
        type: "scout" | "city"
        tile: TileIdentifier,
        country: CountryIdentifier
    }


    export function create(gl: WebGL2RenderingContext, tiles: Tile[], cities: City[], commands: Command[], shaderAttributes: GLProgramAttribute[]): MeshData {
        const entities = collectEntities(tiles, cities, commands);
        const amountEntities = entities.length;

        const indices = new MixedArrayBuffer(
            MixedArrayBuffer.getTotalRequiredBytes(amountEntities * INDICES_PER_ENTITY, PATTERN_INDEX),
            PATTERN_INDEX,
        );
        const vertices = new MixedArrayBuffer(
            MixedArrayBuffer.getTotalRequiredBytes(amountEntities * VERTICES_PER_ENTITY * VALUES_PER_VERTEX, PATTERN_VERTEX),
            PATTERN_VERTEX,
        );
        const cursorIndices = new MixedArrayBufferCursor(indices);
        const cursorVertices = new MixedArrayBufferCursor(vertices);

        let indexOffset = 0;
        for (let i = 0; i < amountEntities; i++) {
            indexOffset = pushEntityIndices(indexOffset, cursorIndices);
            pushEntityVertices(entities[i], cursorVertices);
        }

        return MeshData.create(gl,
            indices,
            vertices,
            amountEntities * INDICES_PER_ENTITY,
            (vertexBuffer) => [
                {
                    buffer: vertexBuffer,
                    location: shaderAttributes.find(a => a.name === "in_worldPosition")!.location,
                    type: GLAttributeType.FLOAT,
                    amountComponents: 2,
                },
                {
                    buffer: vertexBuffer,
                    location: shaderAttributes.find(a => a.name === "in_textureCoordinates")!.location,
                    type: GLAttributeType.FLOAT,
                    amountComponents: 2,
                },
            ],
        );

    }

    function collectEntities(tiles: Tile[], cities: City[], commands: Command[]): RenderEntity[] {

        const entities: RenderEntity[] = [];

        for (let i = 0, n = tiles.length; i < n; i++) {
            const tile = tiles[i];
            if (tile.content) {
                for (let j = 0; j < tile.content.length; j++) {
                    entities.push({
                        type: "scout",
                        tile: tile.identifier,
                        country: tile.content[j].country,
                    });
                }
            }
        }

        for (let i = 0; i < cities.length; i++) {
            const city = cities[i];
            entities.push({
                type: "city",
                tile: city.tile,
                country: city.country,
            });
        }

        for (let i = 0; i < commands.length; i++) {
            const command = commands[i];
            if (command.type === "scout.place") {
                entities.push({
                    type: "scout",
                    tile: (command as PlaceScoutCommand).tile,
                    country: Country.UNDEFINED.identifier,
                });
            }
            if (command.type === "settlement.create") {
                entities.push({
                    type: "city",
                    tile: (command as CreateSettlementCommand).tile,
                    country: Country.UNDEFINED.identifier,
                });
            }
        }

        return entities;
    }


    function pushEntityIndices(indexOffset: number, cursor: MixedArrayBufferCursor): number {
        //triangle a
        cursor.append(0 + indexOffset);
        cursor.append(1 + indexOffset);
        cursor.append(2 + indexOffset);
        //triangle b
        cursor.append(0 + indexOffset);
        cursor.append(2 + indexOffset);
        cursor.append(3 + indexOffset);
        return indexOffset + VERTICES_PER_ENTITY;
    }


    function pushEntityVertices(entity: RenderEntity, cursor: MixedArrayBufferCursor) {
        const center = TilemapUtils.hexToPixel(TilemapUtils.DEFAULT_HEX_LAYOUT, entity.tile.q, entity.tile.r);
        const halfWidth = (TilemapUtils.DEFAULT_HEX_LAYOUT.size[0] / 2);
        const halfHeight = (TilemapUtils.DEFAULT_HEX_LAYOUT.size[1] / 2);

        const textUOffset = match(entity.type,
            ["marker", () => 0],
            ["scout", () => 2],
            ["city", () => 1],
        );

        // corner 1
        cursor.append(center[0] - halfWidth);
        cursor.append(center[1] - halfHeight);
        cursor.append(0 + textUOffset / 3);
        cursor.append(0);

        // corner 2
        cursor.append(center[0] + halfWidth);
        cursor.append(center[1] - halfHeight);
        cursor.append(1 / 3 + textUOffset / 3);
        cursor.append(0);

        // corner 3
        cursor.append(center[0] + halfWidth);
        cursor.append(center[1] + halfHeight);
        cursor.append(1 / 3 + textUOffset / 3);
        cursor.append(1);

        // corner 4
        cursor.append(center[0] - halfWidth);
        cursor.append(center[1] + halfHeight);
        cursor.append(0 + textUOffset / 3);
        cursor.append(1);

    }

}