import {
    MixedArrayBuffer,
    MixedArrayBufferCursor,
    MixedArrayBufferType,
} from "../../../../shared/webgl/mixedArrayBuffer";
import {TilemapUtils} from "../../../../logic/game/tilemapUtils";
import {TileDatabase} from "../../../../state/tileDatabase";
import {TerrainType} from "../../../../models/terrainType";
import {Tile, TileIdentifier} from "../../../../models/tile";
import {TerrainResourceType} from "../../../../models/terrainResourceType";
import {TileVisibility} from "../../../../models/tileVisibility";
import {CityTileObject} from "../../../../models/tileObject";
import {CityDatabase} from "../../../../state/cityDatabase";
import {SettlementTier} from "../../../../models/settlementTier";
import {CommandDatabase} from "../../../../state/commandDatabase";
import {CommandType} from "../../../../models/commandType";
import {
    CreateCityCommand,
    DeleteMarkerCommand,
    PlaceMarkerCommand,
    PlaceScoutCommand,
} from "../../../../models/command";

export namespace DetailMeshDataBuilder {

    interface RenderDetail {
        type: number,
        vertexCount: number,
        vertexData: number[],
    }

    const PATTERN_VERTEX = [
        // world position (x,y)
        ...MixedArrayBufferType.VEC2,
        // texture coords (u,v)
        ...MixedArrayBufferType.VEC2,
        // visibility
        MixedArrayBufferType.INT,
    ];


    export function build(tileDb: TileDatabase, cityDb: CityDatabase, commandDb: CommandDatabase): [number, ArrayBuffer] {
        const [vertexCount, details] = collectDetails(tileDb, cityDb, commandDb);
        const [buffer, cursor] = createMixedArray(vertexCount);
        for (let i = 0; i < details.length; i++) {
            const detail = details[i];
            cursor.append(detail.vertexData);
        }
        return [vertexCount, buffer.getRawBuffer()!];
    }


    function createMixedArray(vertexCount: number): [MixedArrayBuffer, MixedArrayBufferCursor] {
        const array = new MixedArrayBuffer(
            MixedArrayBuffer.getTotalRequiredBytes(vertexCount, PATTERN_VERTEX),
            PATTERN_VERTEX,
        );
        const cursor = new MixedArrayBufferCursor(array);
        return [array, cursor];
    }


    function collectDetails(tileDb: TileDatabase, cityDb: CityDatabase, commandDb: CommandDatabase): [number, RenderDetail[]] {

        const commandsCreateCity = commandDb.queryMany(CommandDatabase.QUERY_BY_TYPE, CommandType.CITY_CREATE) as CreateCityCommand[];
        const commandsMarkerDelete = commandDb.queryMany(CommandDatabase.QUERY_BY_TYPE, CommandType.MARKER_DELETE) as DeleteMarkerCommand[];
        const commandsMarkerPlace = commandDb.queryMany(CommandDatabase.QUERY_BY_TYPE, CommandType.MARKER_PLACE) as PlaceMarkerCommand[];
        const commandsScoutPlace = commandDb.queryMany(CommandDatabase.QUERY_BY_TYPE, CommandType.SCOUT_PLACE) as PlaceScoutCommand[];

        function isMarkerDeleted(tile: TileIdentifier) {
            return commandsMarkerDelete.findIndex(cmd => cmd.tile.id === tile.id) === -1;
        }

        const details: RenderDetail[] = [];
        let vertexCount = 0;

        const tiles = tileDb.queryMany(TileDatabase.QUERY_ALL, null);
        for (let i = 0, n = tiles.length; i < n; i++) {
            const tile = tiles[i];

            const detailTerrain = collectTerrainType(tile);
            if (detailTerrain) {
                details.push(detailTerrain);
                vertexCount += detailTerrain.vertexCount;
            }

            if (tile.objects.visible) {

                for (let tileObject of tile.objects.value) {
                    if (tileObject.type === "marker") {
                        if (isMarkerDeleted(tile.identifier)) {
                            const detail = collectMarker(tile.identifier, tile.visibility);
                            details.push(detail);
                            vertexCount += detail.vertexCount;
                        }
                    }
                    if (tileObject.type === "scout") {
                        const detail = collectScout(tile.identifier, tile.visibility);
                        details.push(detail);
                        vertexCount += detail.vertexCount;
                    }
                    if (tileObject.type === "city") {
                        const city = cityDb.querySingle(CityDatabase.QUERY_BY_ID, (tileObject as CityTileObject).city.id);
                        if (city) {
                            const detail = collectSettlement(tile.identifier, tile.visibility, city.tier);
                            details.push(detail);
                            vertexCount += detail.vertexCount;
                        }
                    }
                }

            }

        }

        for (let i = 0; i < commandsCreateCity.length; i++) {
            const command = commandsCreateCity[i];
            const detail = collectSettlement(command.tile, TileVisibility.VISIBLE, SettlementTier.VILLAGE);
            details.push(detail);
            vertexCount += detail.vertexCount;
        }

        for (let i = 0; i < commandsScoutPlace.length; i++) {
            const command = commandsScoutPlace[i];
            const detail = collectScout(command.tile, TileVisibility.VISIBLE);
            details.push(detail);
            vertexCount += detail.vertexCount;
        }

        for (let i = 0; i < commandsMarkerPlace.length; i++) {
            const command = commandsMarkerPlace[i];
            const detail = collectMarker(command.tile, TileVisibility.VISIBLE);
            details.push(detail);
            vertexCount += detail.vertexCount;
        }

        return [vertexCount, details];
    }


    function collectTerrainType(tile: Tile): RenderDetail | null {

        // tileset index
        let tilesetIndex = -1;
        if (tile.basic.terrainType.visible && tile.basic.terrainType.value === TerrainType.MOUNTAIN) {
            if (Math.random() > 0.7) {
                tilesetIndex = 2;
            } else {
                tilesetIndex = 0;
            }
        }
        if (tile.basic.resourceType.visible && tile.basic.resourceType.value === TerrainResourceType.FOREST) {
            tilesetIndex = 1;
        }
        if (tilesetIndex === -1) {
            return null;
        }

        return buildHexTilesetSpriteDetail(
            tile.identifier,
            [0.25, 0.25],
            TilemapUtils.DEFAULT_HEX_LAYOUT.size,
            tile.visibility,
            tilesetIndex,
        );
    }

    function collectSettlement(tile: TileIdentifier, visibility: TileVisibility, tier: SettlementTier): RenderDetail {

        let tilesetIndex = 3;
        if (tier === SettlementTier.VILLAGE) tilesetIndex = 3;
        if (tier === SettlementTier.TOWN) tilesetIndex = 4;
        if (tier === SettlementTier.CITY) tilesetIndex = 5;

        const size: [number, number] = [
            TilemapUtils.DEFAULT_HEX_LAYOUT.size[0] * 2,
            TilemapUtils.DEFAULT_HEX_LAYOUT.size[1] * 2,
        ];

        return buildHexTilesetSpriteDetail(
            tile,
            [0.25, 0.25],
            size,
            visibility,
            tilesetIndex,
        );
    }

    function collectScout(tile: TileIdentifier, visibility: TileVisibility): RenderDetail {
        const size: [number, number] = [
            TilemapUtils.DEFAULT_HEX_LAYOUT.size[0] * 1.75,
            TilemapUtils.DEFAULT_HEX_LAYOUT.size[1] * 1.75,
        ];
        return buildHexTilesetSpriteDetail(
            tile,
            [0.25, 0.25],
            size,
            visibility,
            6,
        );
    }


    function collectMarker(tile: TileIdentifier, visibility: TileVisibility): RenderDetail {
        const size: [number, number] = [
            TilemapUtils.DEFAULT_HEX_LAYOUT.size[0] * 1.75,
            TilemapUtils.DEFAULT_HEX_LAYOUT.size[1] * 1.75,
        ];
        return buildHexTilesetSpriteDetail(
            tile,
            [0.25, 0.25],
            size,
            visibility,
            7,
        );
    }

    function buildHexTilesetSpriteDetail(
        tileIdentifier: TileIdentifier,
        randomOffsetScale: [number, number],
        size: [number, number],
        visibility: TileVisibility,
        tilesetIndex: number,
    ): RenderDetail {

        // world position
        const randomOffsetX = ((Math.random() * 2) - 1) * TilemapUtils.DEFAULT_HEX_LAYOUT.size[0] * randomOffsetScale[0];
        const randomOffsetY = ((Math.random() * 2) - 1) * TilemapUtils.DEFAULT_HEX_LAYOUT.size[0] * randomOffsetScale[1];
        const center = TilemapUtils.hexToPixel(TilemapUtils.DEFAULT_HEX_LAYOUT, tileIdentifier.q, tileIdentifier.r);
        center[0] = center[0] + randomOffsetX;
        center[1] = center[1] + randomOffsetY;

        // texture coords
        const tilesetCount = 8;
        const minU = tilesetIndex / tilesetCount;
        const maxU = tilesetIndex / tilesetCount + (1 / tilesetCount);
        const uv0: [number, number] = [minU, 0];
        const uv1: [number, number] = [maxU, 1];

        // visibility
        let visibilityId: number;
        if (visibility === TileVisibility.VISIBLE) {
            visibilityId = 2;
        } else if (visibility === TileVisibility.DISCOVERED) {
            visibilityId = 1;
        } else {
            visibilityId = 0;
        }

        const vertexData: number[] = [

            // triangle a
            center[0] - size[0],
            center[1] - size[1],
            uv0[0],
            uv0[1],
            visibilityId,

            center[0] + size[0],
            center[1] - size[1],
            uv1[0],
            uv0[1],
            visibilityId,

            center[0] + size[0],
            center[1] + size[1],
            uv1[0],
            uv1[1],
            visibilityId,

            // triangle b
            center[0] - size[0],
            center[1] - size[1],
            uv0[0],
            uv0[1],
            visibilityId,

            center[0] - size[0],
            center[1] + size[1],
            uv0[0],
            uv1[1],
            visibilityId,

            center[0] + size[0],
            center[1] + size[1],
            uv1[0],
            uv1[1],
            visibilityId,

        ];

        return {
            type: 1,
            vertexCount: 6,
            vertexData: vertexData,
        };
    }

}