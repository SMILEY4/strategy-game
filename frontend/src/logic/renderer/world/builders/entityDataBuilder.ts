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
import {TextRenderer} from "../../common/textRenderer";
import {Camera} from "../../common/camera";
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
        MixedArrayBufferType.INT,
    ];

    const INDICES_PER_ENTITY = 6;
    const VERTICES_PER_ENTITY = 4;
    const VALUES_PER_VERTEX = PATTERN_VERTEX.length;


    interface RenderEntity {
        type: "scout" | "city"
        tile: TileIdentifier,
        label: string | null,
        country: CountryIdentifier
    }


    export function create(
        gl: WebGL2RenderingContext,
        camera: Camera,
        tiles: Tile[],
        cities: City[],
        commands: Command[],
        shaderAttributes: GLProgramAttribute[],
        textRenderer: TextRenderer,
    ): MeshData {

        const entities = collectEntities(tiles, cities, commands);
        let amountSprites = 0;
        entities.forEach(e => {
            amountSprites++;
            if (e.label) amountSprites++;
        });

        prepareTextTexture(textRenderer, entities);

        const indices = new MixedArrayBuffer(
            MixedArrayBuffer.getTotalRequiredBytes(amountSprites * INDICES_PER_ENTITY, PATTERN_INDEX),
            PATTERN_INDEX,
        );
        const vertices = new MixedArrayBuffer(
            MixedArrayBuffer.getTotalRequiredBytes(amountSprites * VERTICES_PER_ENTITY * VALUES_PER_VERTEX, PATTERN_VERTEX),
            PATTERN_VERTEX,
        );
        const cursorIndices = new MixedArrayBufferCursor(indices);
        const cursorVertices = new MixedArrayBufferCursor(vertices);

        let indexOffset = 0;
        for (let i = 0; i < entities.length; i++) {
            const entity = entities[i];
            indexOffset = pushEntityIndices(indexOffset, cursorIndices);
            if (entity.label) {
                indexOffset = pushEntityIndices(indexOffset, cursorIndices);
            }
            pushEntityVertices(entity, camera, cursorVertices, textRenderer);
        }

        return MeshData.create(gl,
            indices,
            vertices,
            amountSprites * INDICES_PER_ENTITY,
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
                {
                    buffer: vertexBuffer,
                    location: shaderAttributes.find(a => a.name === "in_textureIndex")!.location,
                    type: GLAttributeType.INT,
                    amountComponents: 1,
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
                        label: null,
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
                label: city.identifier.name,
            });
        }

        for (let i = 0; i < commands.length; i++) {
            const command = commands[i];
            if (command.type === "scout.place") {
                entities.push({
                    type: "scout",
                    tile: (command as PlaceScoutCommand).tile,
                    country: Country.UNDEFINED.identifier,
                    label: null,
                });
            }
            if (command.type === "settlement.create") {
                entities.push({
                    type: "city",
                    tile: (command as CreateSettlementCommand).tile,
                    country: Country.UNDEFINED.identifier,
                    label: (command as CreateSettlementCommand).name,
                });
            }
        }

        return entities;
    }

    function prepareTextTexture(textRenderer: TextRenderer, entities: RenderEntity[]) {
        textRenderer.removeAll();
        const wasNewTextAdded = entities
            .filter(entity => !!entity.label)
            .map(entity => textRenderer.addTextIfNotExists(entity.label!!, {
                text: entity.label!!,
                width: null,
                height: 30,
                font: "bold 24px 'Alegreya SC'",
                color: "black",
                align: "center" as CanvasTextAlign,
                baseline: "middle" as CanvasTextBaseline,
                shadowBlur: 4,
                shadowColor: "white",
            }))
            .some(added => added);
        if (wasNewTextAdded) {
            textRenderer.update();
        }
    }

    function pushEntityIndices(indexOffset: number, cursor: MixedArrayBufferCursor): number {
        return pushRectangleIndices(indexOffset, cursor);
    }


    function pushEntityVertices(entity: RenderEntity, camera: Camera, cursor: MixedArrayBufferCursor, textRenderer: TextRenderer) {
        const center = TilemapUtils.hexToPixel(TilemapUtils.DEFAULT_HEX_LAYOUT, entity.tile.q, entity.tile.r);
        const halfWidth = (TilemapUtils.DEFAULT_HEX_LAYOUT.size[0] / 2);
        const halfHeight = (TilemapUtils.DEFAULT_HEX_LAYOUT.size[1] / 2);

        const textUOffset = match(entity.type,
            ["marker", () => 0],
            ["scout", () => 2],
            ["city", () => 1],
        );

        pushRectangleVertices(
            cursor,
            center[0] - halfWidth,
            center[1] - halfHeight,
            center[0] + halfWidth,
            center[1] + halfHeight,
            0 + textUOffset / 3,
            0,
            1 / 3 + textUOffset / 3,
            1,
            0,
        );

        if (entity.label) {
            const region = textRenderer.getRegion(entity.label)!!;
            pushRectangleVertices(
                cursor,
                center[0] - region.width / camera.getZoom() * 0.5,
                center[1] - region.height / camera.getZoom() * 0.5 - 5,
                center[0] + region.width / camera.getZoom() * 0.5,
                center[1] + region.height / camera.getZoom() * 0.5 - 5,
                region.u0,
                region.v0,
                region.u1,
                region.v1,
                1,
            );
        }

    }


    function pushRectangleIndices(indexOffset: number, cursor: MixedArrayBufferCursor): number {
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


    function pushRectangleVertices(cursor: MixedArrayBufferCursor, minX: number, minY: number, maxX: number, maxY: number, u0: number, v0: number, u1: number, v1: number, textureIndex: number) {
        // corner 1
        cursor.append(minX);
        cursor.append(minY);
        cursor.append(u0);
        cursor.append(v0);
        cursor.append(textureIndex);
        // corner 2
        cursor.append(maxX);
        cursor.append(minY);
        cursor.append(u1);
        cursor.append(v0);
        cursor.append(textureIndex);
        // corner 3
        cursor.append(maxX);
        cursor.append(maxY);
        cursor.append(u1);
        cursor.append(v1);
        cursor.append(textureIndex);
        // corner 4
        cursor.append(minX);
        cursor.append(maxY);
        cursor.append(u0);
        cursor.append(v1);
        cursor.append(textureIndex);
    }


}