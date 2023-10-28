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

    export interface BorderData {
        country: boolean,
        province: boolean,
        city: boolean,
    }

    export function buildComplete(tile: Tile, tiles: TileContainer): BorderData[] {
        const country = build(tile, tiles, false, (ta, tb) => {
            const a = ta.owner?.country.id;
            const b = tb.owner?.country.id;
            return (!a && !b) ? false : !!a && a !== b;
        });
        const province = build(tile, tiles, false, (ta, tb) => {
            const a = ta.owner?.province.id;
            const b = tb.owner?.province.id;
            return (!a && !b) ? false : !!a && a !== b;
        });
        const city = build(tile, tiles, false, (ta, tb) => {
            const a = ta.owner?.city?.id;
            const b = tb.owner?.city?.id;
            return (!a && !b) ? false : !!a && a !== b;
        });

        const data: BorderData[] = [];
        for (let i = 0; i < NEIGHBOUR_OFFSETS.length; i++) {
            data.push({
                country: country[i],
                province: province[i],
                city: city[i],
            });
        }
        return data;
    }

    export function build(tile: Tile, tiles: TileContainer, defaultValue: boolean, isBorder: (a: Tile, b: Tile) => boolean): boolean[] {
        return NEIGHBOUR_OFFSETS.map(offset => {
            const neighbour = tiles.getTileAtOrNull(tile.identifier.q + offset[0], tile.identifier.r + offset[1]);
            if (neighbour) {
                return isBorder(tile, neighbour);
            } else {
                return defaultValue;
            }
        });
    }


}