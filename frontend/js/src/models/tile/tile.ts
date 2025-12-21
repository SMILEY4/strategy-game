import {Visibility} from "../misc/visibility";
import {HiddenType} from "../../common/hiddenType";
import {TerrainType} from "../misc/terrainType";
import {Projections} from "../../common/webgl/projections";
import {BrandedId} from "../../common/brandedId";
import Point = Projections.Point;
import {ResourceType} from "../misc/resourceType";
import {ResourceNode} from "../misc/resourceNode";

/**
 * A single world tile.
 */
export interface Tile {
	id: Tile.Id,
	position: Tile.Position
	visibility: Visibility
	base: HiddenType<{
		terrainType: TerrainType,
		height: number,
		resources: ResourceNode[]
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

    export enum HighlightType {
        Active = "active",
        Option = "option",
        OptionSelected = "option-selected",
    }

    export interface Highlight {
        type: HighlightType,
        position: Tile.Position,
        id: Tile.Id,
    }
}

