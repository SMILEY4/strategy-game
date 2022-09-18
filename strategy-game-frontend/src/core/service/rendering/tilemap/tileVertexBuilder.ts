import {GAME_CONFIG} from "../../../../external/state/gameconfig/gameConfigStateAccess";
import {Color} from "../../../../models/state/Color";
import {Country} from "../../../../models/state/country";
import {TerrainType} from "../../../../models/state/terrainType";
import {Tile} from "../../../../models/state/tile";
import {TileVisibility} from "../../../../models/state/tileVisibility";
import {getMax, orDefault} from "../../../../shared/utils";
import {TilemapUtils} from "../../tilemap/tilemapUtils";

export namespace TileVertexBuilder {


    export function vertexData(tile: Tile, countries: Country[]): number[][] {
        const vertexPositions = buildVertexPositions(tile);
        const tilePositions = buildTilePositions(tile);
        const terrainData = buildTerrainData(tile);
        const colors = buildOverlayColors(tile, countries);
        const cornerData = buildCornerData();
        const borderData = buildBorderData(tile);

        const vertexData: number[][] = [];
        for (let i = 0; i < 13; i++) {
            const vertex: number[] = [];
            vertex.push(...vertexPositions[i]);
            vertex.push(...tilePositions[i]);
            vertex.push(...terrainData[i]);
            vertex.push(...colors[i]);
            vertex.push(...cornerData[i]);
            vertex.push(...borderData[i]);
            vertexData.push(vertex);
        }

        return vertexData;
    }

    /**
     * @return the indices for each triangle of the hexagon
     */
    export function indexData(): number[] {
        return [
            // triangle a
            0, 1, 2,
            // triangle b
            0, 3, 4,
            // triangle c
            0, 5, 6,
            // triangle d
            0, 7, 8,
            // triangle e
            0, 9, 10,
            // triangle f
            0, 11, 12,
        ];
    }


    /**
     * @return the positions (x,y) of each vertex of each triangle. First vertex is always the center vertex and is the only shared vertex.
     */
    function buildVertexPositions(tile: Tile): ([number, number])[] {
        const hexSize = TilemapUtils.DEFAULT_HEX_LAYOUT.size;
        const [centerX, centerY] = TilemapUtils.hexToPixel(TilemapUtils.DEFAULT_HEX_LAYOUT, tile.position.q, tile.position.r);
        return [
            // center
            [centerX, centerY],
            // triangle a - corner a,b
            hexCornerPoint(0, hexSize, centerX, centerY),
            hexCornerPoint(1, hexSize, centerX, centerY),
            // triangle b - corner a,b
            hexCornerPoint(1, hexSize, centerX, centerY),
            hexCornerPoint(2, hexSize, centerX, centerY),
            // triangle c - corner a,b
            hexCornerPoint(2, hexSize, centerX, centerY),
            hexCornerPoint(3, hexSize, centerX, centerY),
            // triangle d - corner a,b
            hexCornerPoint(3, hexSize, centerX, centerY),
            hexCornerPoint(4, hexSize, centerX, centerY),
            // triangle e - corner a,b
            hexCornerPoint(4, hexSize, centerX, centerY),
            hexCornerPoint(5, hexSize, centerX, centerY),
            // triangle f - corner a,b
            hexCornerPoint(5, hexSize, centerX, centerY),
            hexCornerPoint(0, hexSize, centerX, centerY)
        ];
    }

    /**
     * @return the tile-position (q,r) for each vertex
     */
    function buildTilePositions(tile: Tile): ([number, number])[] {
        const qr: [number, number] = [tile.position.q, tile.position.r];
        return Array(13).fill(qr);
    }

    /**
     * @return the terrain-id and visibility (id, visId) for each vertex
     */
    function buildTerrainData(tile: Tile): ([number])[] {
        const terrainId: number = tile.generalData ? terrainTypeToId(tile.generalData.terrainType) : -1;
        const visibility = tileVisibilityToId(tile.visibility);
        return Array(13).fill([terrainId, visibility]);
    }

    /**
     * @return the primary overlay-color (rgba) for each vertex
     */
    function buildOverlayColors(tile: Tile, countries: Country[]): ([number, number, number, number])[] {
        const color: [number, number, number, number] = tileOwnerColor(tile, countries);
        return Array(13).fill(color);
    }

    /**
     * @return information about the closes corner, i.e. 1 = point directly in corner, 0 = point far away from corner
     * (center, cornerA, cornerB)
     */
    function buildCornerData(): ([number, number, number])[] {
        return [
            // center
            [1, 0, 0],
            // triangle a - corner a,b
            [0, 1, 0],
            [0, 0, 1],
            // triangle b - corner a,b
            [0, 1, 0],
            [0, 0, 1],
            // triangle c - corner a,b
            [0, 1, 0],
            [0, 0, 1],
            // triangle d - corner a,b
            [0, 1, 0],
            [0, 0, 1],
            // triangle e - corner a,b
            [0, 1, 0],
            [0, 0, 1],
            // triangle f - corner a,b
            [0, 1, 0],
            [0, 0, 1],
        ];
    }

    /**
     * @return information about what border to use for each vertex/triangle. ID: 0 = no border, 1 = primary border, 2 = secondary border.
     * (id border, id corner-a, id corner-b)
     */
    function buildBorderData(tile: Tile): ([number, number, number])[] {
        const countryBorderData = orDefault(tile.borderData.find(b => b.type === "country")?.directions, Array(6).fill(false));
        const provinceBorderData = orDefault(tile.borderData.find(b => b.type === "province")?.directions, Array(6).fill(false));

        function getBorderId(index: number) {
            if (countryBorderData[index]) {
                return 1;
            }
            if (provinceBorderData[index]) {
                return 2;
            }
            return 0;
        }

        return [
            // center
            [0, 0, 0],
            // triangle a - corner a,b
            [getBorderId(0), getBorderId(5), getBorderId(1)],
            [getBorderId(0), getBorderId(5), getBorderId(1)],
            // triangle b - corner a,b
            [getBorderId(1), getBorderId(0), getBorderId(2)],
            [getBorderId(1), getBorderId(0), getBorderId(2)],
            // triangle c - corner a,b
            [getBorderId(2), getBorderId(1), getBorderId(3)],
            [getBorderId(2), getBorderId(1), getBorderId(3)],
            // triangle d - corner a,b
            [getBorderId(3), getBorderId(2), getBorderId(4)],
            [getBorderId(3), getBorderId(2), getBorderId(4)],
            // triangle e - corner a,b
            [getBorderId(4), getBorderId(3), getBorderId(5)],
            [getBorderId(4), getBorderId(3), getBorderId(5)],
            // triangle f - corner a,b
            [getBorderId(5), getBorderId(4), getBorderId(0)],
            [getBorderId(5), getBorderId(4), getBorderId(0)],
        ];
    }


    function hexCornerPoint(i: number, size: [number, number], offX: number, offY: number): [number, number] {
        const angleDeg = 60 * i - 30;
        const angleRad = Math.PI / 180 * angleDeg;
        return [
            size[0] * Math.cos(angleRad) + offX,
            size[1] * Math.sin(angleRad) + offY
        ];
    }

    function terrainTypeToId(type: TerrainType): number {
        if (type == TerrainType.WATER) {
            return 0;
        }
        if (type == TerrainType.LAND) {
            return 1;
        }
        return -1;
    }

    function tileVisibilityToId(visibility: TileVisibility): number {
        if (visibility == TileVisibility.UNKNOWN) {
            return 0;
        }
        if (visibility == TileVisibility.DISCOVERED) {
            return 1;
        }
        if (visibility == TileVisibility.VISIBLE) {
            return 2;
        }
        return 0;
    }

    function tileOwnerColor(tile: Tile, countries: Country[]): [number, number, number, number] {
        if (!tile.generalData) {
            return [0, 0, 0, 0];
        } else if (tile.generalData.owner) {
            return countryColor(tile.generalData.owner.countryColor, 1);
        } else {
            const influences = tile.advancedData ? tile.advancedData.influences : [];
            const influenceThreshold = GAME_CONFIG.getGameConfig().cityTileMaxForeignInfluence;
            const maxInfluenceCountry = getMax(influences, influence => influence.value);
            const nextMaxInfluenceCountry = getMax(influences, influence => influence.countryId === maxInfluenceCountry?.countryId ? -1 : influence.value);
            const nextMaxInfluenceValue = nextMaxInfluenceCountry ? nextMaxInfluenceCountry.value : -1;
            if (maxInfluenceCountry && maxInfluenceCountry.value > influenceThreshold && maxInfluenceCountry.value > nextMaxInfluenceValue) {
                return countryColor(countries.find(c => c.countryId === maxInfluenceCountry.countryId)?.color, 0.3);
            }
            return [0, 0, 0, 0];
        }
    }

    function countryColor(color: Color | undefined, strength: number): [number, number, number, number] {
        if (color) {
            return [color.red / 255, color.green / 255, color.blue / 255, strength];
        } else {
            return [1, 1, 1, strength];
        }
    }

}