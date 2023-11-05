import {Tile} from "../../../../models/tile";

export namespace RenderBuilderUtils {

    export function hexCornerPointX(cornerIndex: number, size: [number, number], offset: [number, number]): number {
        const angleDeg = 60 * cornerIndex - 30;
        const angleRad = Math.PI / 180 * angleDeg;
        return size[0] * Math.cos(angleRad) + offset[0];
    }

    export function hexCornerPointY(cornerIndex: number, size: [number, number], offset: [number, number]): number {
        const angleDeg = 60 * cornerIndex - 30;
        const angleRad = Math.PI / 180 * angleDeg;
        return size[1] * Math.sin(angleRad) + offset[1];
    }

    export function hexTextureCoordinates(cornerIndex: number, tileSetOffset: number): [number, number] {
        const tileCount = 4;
        const shrink = 0.01;
        const x1 = (0 + tileSetOffset) / tileCount + shrink;
        const x2 = (0.5 + tileSetOffset) / tileCount;
        const x3 = (1 + tileSetOffset) / tileCount - shrink;
        const y1 = 0 + shrink;
        const y2 = 0.25;
        const y3 = 0.75;
        const y4 = 1 - shrink;
        switch (cornerIndex) {
            case -1:
                return [x2, 0.5];
            case 0:
                return [x3, y2];
            case 1:
                return [x3, y3];
            case 2:
                return [x2, y4];
            case 3:
                return [x1, y3];
            case 4:
                return [x1, y2];
            case 5:
                return [x2, y1];
            default:
                return [0, 0];
        }
    }


    export function toTerrainId(tile: Tile) {
        switch (tile.terrainType) {
            case "WATER":
                return 0;
            case "LAND":
                return 3;
            case "MOUNTAIN":
                return 2;
            default:
                return 3;
        }
    }

    export function toVisibilityId(tile: Tile) {
        switch (tile.visibility) {
            case "UNKNOWN":
                return 0;
            case "DISCOVERED":
                return 1;
            case "VISIBLE":
                return 2;
        }
    }

}