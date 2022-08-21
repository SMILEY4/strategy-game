import {CountryColor} from "../../../../models/state/country";
import {TerrainType} from "../../../../models/state/terrainType";
import {Tile} from "../../../../models/state/tile";
import {orDefault} from "../../../../shared/utils";
import {TilemapUtils} from "../../tilemap/tilemapUtils";

export namespace TileVertexBuilder {


    export function vertexData(tile: Tile): number[][] {
        const vertexPositions = buildVertexPositions(tile);
        const tilePositions = buildTilePositions(tile);
        const terrainData = buildTerrainData(tile);
        const colors = buildOverlayColors(tile);
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

    export function indexData(): number[] {
        return [
            0, 1, 2,
            0, 3, 4,
            0, 5, 6,
            0, 7, 8,
            0, 9, 10,
            0, 11, 12,
        ];
    }


    function buildVertexPositions(tile: Tile): ([number, number])[] {
        const hexSize = TilemapUtils.DEFAULT_HEX_LAYOUT.size;
        const [centerX, centerY] = TilemapUtils.hexToPixel(TilemapUtils.DEFAULT_HEX_LAYOUT, tile.position.q, tile.position.r);
        return [
            [centerX, centerY],
            hexCornerPoint(0, hexSize, centerX, centerY),
            hexCornerPoint(1, hexSize, centerX, centerY),
            hexCornerPoint(1, hexSize, centerX, centerY),
            hexCornerPoint(2, hexSize, centerX, centerY),
            hexCornerPoint(2, hexSize, centerX, centerY),
            hexCornerPoint(3, hexSize, centerX, centerY),
            hexCornerPoint(3, hexSize, centerX, centerY),
            hexCornerPoint(4, hexSize, centerX, centerY),
            hexCornerPoint(4, hexSize, centerX, centerY),
            hexCornerPoint(5, hexSize, centerX, centerY),
            hexCornerPoint(5, hexSize, centerX, centerY),
            hexCornerPoint(0, hexSize, centerX, centerY)
        ];
    }

    function buildTilePositions(tile: Tile): ([number, number])[] {
        const qr: [number, number] = [tile.position.q, tile.position.r];
        return Array(13).fill(qr);
    }

    function buildTerrainData(tile: Tile): ([number])[] {
        const terrainId: [number] = [terrainTypeToId(tile.terrainType)];
        return Array(13).fill(terrainId);
    }


    function buildOverlayColors(tile: Tile): ([number, number, number, number])[] {
        const color: [number, number, number, number] = tileOwnerColor(tile);
        return Array(13).fill(color);
    }


    function buildCornerData(): ([number, number, number])[] {
        return [
            [1, 0, 0],
            [0, 1, 0],
            [0, 0, 1],
            [0, 1, 0],
            [0, 0, 1],
            [0, 1, 0],
            [0, 0, 1],
            [0, 1, 0],
            [0, 0, 1],
            [0, 1, 0],
            [0, 0, 1],
            [0, 1, 0],
            [0, 0, 1],
        ];
    }

    function buildBorderData(tile: Tile): ([number, number])[] {
        const countryBorderData = orDefault(tile.borderData.find(b => b.type === "country")?.directions, Array(6).fill(false));
        const provinceBorderData = orDefault(tile.borderData.find(b => b.type === "province")?.directions, Array(6).fill(false));
        return [
            [0, 0],
            [countryBorderData[0] ? 1 : 0, provinceBorderData[0] ? 1 : 0],
            [countryBorderData[0] ? 1 : 0, provinceBorderData[0] ? 1 : 0],
            [countryBorderData[1] ? 1 : 0, provinceBorderData[1] ? 1 : 0],
            [countryBorderData[1] ? 1 : 0, provinceBorderData[1] ? 1 : 0],
            [countryBorderData[2] ? 1 : 0, provinceBorderData[2] ? 1 : 0],
            [countryBorderData[2] ? 1 : 0, provinceBorderData[2] ? 1 : 0],
            [countryBorderData[3] ? 1 : 0, provinceBorderData[3] ? 1 : 0],
            [countryBorderData[3] ? 1 : 0, provinceBorderData[3] ? 1 : 0],
            [countryBorderData[4] ? 1 : 0, provinceBorderData[4] ? 1 : 0],
            [countryBorderData[4] ? 1 : 0, provinceBorderData[4] ? 1 : 0],
            [countryBorderData[5] ? 1 : 0, provinceBorderData[5] ? 1 : 0],
            [countryBorderData[5] ? 1 : 0, provinceBorderData[5] ? 1 : 0],
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

    function tileOwnerColor(tile: Tile): [number, number, number, number] {
        if (tile.owner) {
            if (tile.owner.countryColor === CountryColor.RED) return [1, 0, 0, 1];
            if (tile.owner.countryColor === CountryColor.GREEN) return [0, 1, 0, 1];
            if (tile.owner.countryColor === CountryColor.BLUE) return [0, 0, 1, 1];
            if (tile.owner.countryColor === CountryColor.CYAN) return [0, 1, 1, 1];
            if (tile.owner.countryColor === CountryColor.MAGENTA) return [1, 0, 1, 1];
            if (tile.owner.countryColor === CountryColor.YELLOW) return [1, 1, 0, 1];
            return [1, 1, 1, 1];
        } else {
            return [0, 0, 0, 0];
        }
    }

}