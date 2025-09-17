import {Visibility} from "../misc/visibility";
import {HiddenType} from "../../common/hiddenType";
import {TerrainType} from "../misc/terrainType";
import {Projections} from "../../common/webgl/projections";
import {BrandedId} from "../../common/brandedId";
import Point = Projections.Point;
import {TileResourceType} from "../misc/tileResourceType";

/**
 * A single world tile.
 */
export interface Tile {
	id: Tile.Id,
	position: Tile.Position
	visibility: Visibility
	base: HiddenType<{
		terrainType: TerrainType,
		resourceType: TileResourceType,
		height: number
	}>,
	metaProperties: {
		worldPosition: Point,
		seed: number,
	}
}

export namespace Tile {

	export type Id = BrandedId<string, "TileId">;

	/**
	 * Position of a tile
	 */
	export interface Position {
		q: number,
		r: number
	}

	export const POSITION_NOWHERE: Tile.Position = {q: 9999999, r: 9999999};

}