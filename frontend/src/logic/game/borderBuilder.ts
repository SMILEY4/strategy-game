import {TileContainer} from "../../models/tileContainer";
import {Tile} from "../../models/tile";

export namespace BorderBuilder {

    const NEIGHBOUR_OFFSETS = [
        [+1, +0], // right
        [+0, +1], // top right
        [-1, +1], // top left
        [-1, +0], // left
        [+0, -1], // bottom left
        [+1, -1], // bottom right
    ];

    export function build(tile: Tile, tiles: TileContainer, defaultValue: boolean, isSame: (a: Tile, b: Tile) => boolean): boolean[] {
        return NEIGHBOUR_OFFSETS.map(offset => {
            const neighbour = tiles.getTileAtOrNull(tile.identifier.q + offset[0], tile.identifier.r + offset[1]);
            if (neighbour) {
                return !isSame(tile, neighbour);
            } else {
                return defaultValue;
            }
        });
    }

}