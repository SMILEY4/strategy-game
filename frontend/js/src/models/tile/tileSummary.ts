import {Tile} from "./tile";

/**
 * A tile reduced to the minimum amount of information.
 */
export interface TileSummary {
	id: Tile.Id,
	position: Tile.Position,
}

export namespace TileSummary {

	export function from(tile: Tile): TileSummary {
		return {
			id: tile.id,
			position: tile.position,
		};
	}

	export function fromOrNull(tile: Tile | null): TileSummary | null {
		if (tile) {
			return {
				id: tile.id,
				position: tile.position,
			};
		} else {
			return null;
		}
	}

}