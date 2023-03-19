import {ResourceType} from "../../models/resourceType";
import {TerrainType} from "../../models/terrainType";
import {Tile} from "../../models/tile";
import {TileLayerMeta} from "../../models/tileLayerMeta";
import {TileVisibility} from "../../models/tileVisibility";
import {TilemapUtils} from "../../tilemap/tilemapUtils";

export namespace TileVertexBuilder {


    export function vertexData(tile: Tile): number[][] {

        const vertexPositions = buildVertexPositions(tile);
        const tilePositions = buildTilePositions(tile);
        const cornerData = buildCornerData();

        const terrainData = buildTerrainData(tile);

        const layersData = TileLayerMeta.TILE_LAYERS.map(layerMeta => ({
            values: buildLayerDataValues(layerMeta, tile),
            borders: buildLayerDataBorders(layerMeta, tile)
        }));

        const vertexData: number[][] = [];
        for (let i = 0; i < 13; i++) {
            const vertex: number[] = [];
            vertex.push(...vertexPositions[i]);
            vertex.push(...tilePositions[i]);
            vertex.push(...cornerData[i]);
            vertex.push(...terrainData[i]);
            layersData.forEach(layer => {
                vertex.push(...layer.values[i]);
                vertex.push(...layer.borders[i]);
            });
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
     * @return the (terrainId, resourceId, visibilityId) for each vertex
     */
    function buildTerrainData(tile: Tile): ([number])[] {
        const terrainId: number = tile.dataTier1 ? terrainTypeToId(tile.dataTier1.terrainType) : -1;
        const resourceId: number = tile.dataTier1 ? resourceTypeToId(tile.dataTier1.resourceType) : -1;
        const visibility = tileVisibilityToId(tile.visibility);
        return Array(13).fill([terrainId, resourceId, visibility]);
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
        if (type == TerrainType.MOUNTAIN) {
            return 2;
        }
        return -1;
    }

    function resourceTypeToId(type: ResourceType): number {
        if (type === ResourceType.FOREST) {
            return 0;
        }
        if (type === ResourceType.FISH) {
            return 1;
        }
        if (type === ResourceType.STONE) {
            return 2;
        }
        if (type === ResourceType.METAL) {
            return 3;
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


    /**
     * @return the values of the tile-layer (value_0, ..., value_n) with n_max <= 4
     * */
    function buildLayerDataValues(layerMeta: TileLayerMeta, tile: Tile): (number[])[] {
        const layer = tile.layers.find(l => l.layerId === layerMeta.layerId)!!;
        return Array(13).fill(layer.value);
    }


    /**
     * @return the border-information about the tile-layer (border, borderPrev, borderNext)
     * */
    function buildLayerDataBorders(layerMeta: TileLayerMeta, tile: Tile): (number[])[] {
        const layer = tile.layers.find(l => l.layerId === layerMeta.layerId)!!;
        const borderData = layer.borderDirections;

        function getBorderId(index: number) {
            return borderData[index] ? 1 : 0;
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

}