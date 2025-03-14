import {TileId} from "./tileId";
import {TilePosition} from "./tilePosition";
import {Tile} from "./tile";

export interface TileSummary {
	id: TileId,
	position: TilePosition,
}

export namespace TileSummary {

	export function from(tile: Tile): TileSummary {
		return {
			id: tile.id,
			position: tile.position,
		}
	}

}