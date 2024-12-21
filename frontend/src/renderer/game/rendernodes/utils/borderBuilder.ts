import {Tile} from "../../../../models/base/tile";

export namespace BorderBuilder {

	const NEIGHBOUR_OFFSETS = [
		[+1, +0], // right
		[+0, +1], // top right
		[-1, +1], // top left
		[-1, +0], // left
		[+0, -1], // bottom left
		[+1, -1], // bottom right
	];

	export function build(tile: Tile, tileProvider: (q: number, r: number) => Tile | null, defaultValue: boolean, isBorder: (a: Tile, b: Tile) => boolean): boolean[] {
		return NEIGHBOUR_OFFSETS.map(offset => {
			const neighbour = tileProvider(tile.identifier.q + offset[0], tile.identifier.r + offset[1]);
			if (neighbour) {
				return isBorder(tile, neighbour);
			} else {
				return defaultValue;
			}
		});
	}

}