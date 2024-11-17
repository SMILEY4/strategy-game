import {TerrainType} from "./TerrainType";
import {TileResourceType} from "./TileResourceType";
import {TileIdentifier} from "./tile";

export interface Building {
	type: string,
	workTile: {
		requiredTerrain: TerrainType | null,
		requiredResource: TileResourceType | null,
		tile: TileIdentifier | null
	},
	validity: {
		workTile: boolean,
		inputResources: boolean
	},
	activity: {
		consumed: ({
			type: string,
			amount: number
		})[],
		produced: ({
			type: string,
			amount: number
		})[],
		missing: ({
			type: string,
			amount: number
		})[],
	}
}