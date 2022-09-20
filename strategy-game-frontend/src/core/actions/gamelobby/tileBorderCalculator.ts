import {Tile} from "../../../models/state/tile";
import {orDefault} from "../../../shared/utils";

export class TileBorderCalculator {

    private readonly NEIGHBOUR_OFFSETS = [
        [+1, +0], // right
        [+0, +1], // top right
        [-1, +1], // top left
        [-1, +0], // left
        [+0, -1], // bottom left
        [+1, -1], // bottom right
    ];

    private readonly FALLBACK_BORDERS = [false, false, false, false, false, false];

    private readonly tiles: Tile[][];


    constructor(tiles: Tile[]) {
        const map: Tile[][] = [];
        tiles.forEach(tile => {
            if (map[tile.position.q] === undefined) {
                map[tile.position.q] = [];
            }
            map[tile.position.q][tile.position.r] = tile;
        });
        this.tiles = map;
    }


    public getBorderDirections<T>(q: number, r: number, valueProvider: (tile: Tile) => (T | null | undefined)): boolean[] {
        const tile = this.getTileAt(q, r);
        if (tile) {
            let valueThis = orDefault(valueProvider(tile), null);
            return this.getNeighbourValues(q, r, valueProvider, null)
                .map(neighbourValue => neighbourValue != valueThis);
        } else {
            return this.FALLBACK_BORDERS;
        }
    }


    private getNeighbourValues<T>(q: number, r: number, valueProvider: (tile: Tile) => (T | null | undefined), defaultValue: T): T[] {
        return this.NEIGHBOUR_OFFSETS
            .map(([offQ, offR]) => this.getTileAt(q + offQ, r + offR))
            .map(neighbour => {
                if (neighbour) {
                    const v = valueProvider(neighbour);
                    return (v === null || v === undefined) ? defaultValue : v;
                } else {
                    return defaultValue;
                }
            });
    }


    private getTileAt(q: number, r: number): Tile | null {
        const slice = this.tiles[q];
        if (slice) {
            const tile = slice[r];
            if (tile) {
                return tile;
            }
        }
        return null;
    }

}