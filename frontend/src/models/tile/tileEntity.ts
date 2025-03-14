import {Visibility} from "../misc/visibility";
import {HiddenType} from "../../common/hiddenType";
import {TerrainType} from "./TerrainType";
import {TileResourceType} from "./TileResourceType";
import {CountrySummary} from "../country/countrySummary";
import {SettlementSummary} from "../settlement/settlementSummary";
import {TileId} from "./tileId";
import {TilePosition} from "./tilePosition";
import {TileObject} from "./tileObject";

export interface TileEntity {
	id: TileId,
	position: TilePosition
	visibility: Visibility
	base: HiddenType<{
		terrainType: TerrainType,
		resourceType: TileResourceType,
		height: number
	}>,
	political: HiddenType<{
		controlledBy: null | {
			country: CountrySummary,
			settlement: SettlementSummary
		}
	}>,
	isValidSettlementLocation: boolean,
	objects: TileObject[]
}