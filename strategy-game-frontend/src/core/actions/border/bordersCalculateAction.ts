/**
 * Calculate and enrich the given tiles with border information
 */
import {Tile} from "../../../models/state/tile";

export class BordersCalculateAction {

    constructor() {}

    perform(tiles: Tile[]): void {
        console.log("calculating border information");
        const map = this.buildOptimizedMap(tiles);
        tiles
            .filter(tile => !!tile.owner)
            .forEach(tile => {
                const countryBorders: boolean[] = this.getNeighbours(map, tile, tile => tile.owner?.countryId, null)
                    .map(neighbour => neighbour !== tile.owner?.countryId);
                const provinceBorders: boolean[] = this.getNeighbours(map, tile, tile => tile.owner?.provinceId, null)
                    .map(neighbour => neighbour !== tile.owner?.provinceId);
                tile.borderData = [
                    {
                        type: "country",
                        directions: countryBorders
                    },
                    {
                        type: "province",
                        directions: provinceBorders
                    }
                ]
            });
    }

    private readonly NEIGHBOUR_OFFSETS = [
        [+1, +0], // right
        [+0, +1], // top right
        [-1, +1], // top left
        [-1, +0], // left
        [+0, -1], // bottom left
        [+1, -1], // bottom right
    ];

    private getNeighbours<T>(tiles: Tile[][], tile: Tile, value: (tile: Tile) => (T | null | undefined), defaultValue: T): T[] {
        return this.NEIGHBOUR_OFFSETS
            .map(([offQ, offR]) => this.getTile(tiles, tile.position.q + offQ, tile.position.r + offR))
            .map(neighbour => {
                if (neighbour) {
                    const v = value(neighbour);
                    return (v === null || v === undefined) ? defaultValue : v;
                } else {
                    return defaultValue;
                }
            });
    }

    private buildOptimizedMap(tiles: Tile[]): Tile[][] {
        const map: Tile[][] = [];
        tiles.forEach(tile => {
            if (map[tile.position.q] === undefined) {
                map[tile.position.q] = [];
            }
            map[tile.position.q][tile.position.r] = tile;
        });
        return map;
    }


    private getTile(tiles: Tile[][], q: number, r: number): Tile | null {
        const first = tiles[q];
        if (first) {
            const second = first[r];
            if (second) {
                return second;
            }
        }
        return null;
    }

}