import {HiddenType} from "./hiddenType";
import {Visibility} from "./visibility";
import {TerrainType} from "./TerrainType";
import {TileResourceType} from "./TileResourceType";
import {CountryIdentifier} from "./country";
import {ProvinceIdentifier} from "./province";
import {SettlementIdentifier} from "./Settlement";

export interface TileIdentifier {
	id: string,
	q: number,
	r: number,
}

export interface Tile {
	identifier: TileIdentifier,
	visibility: Visibility
	base: HiddenType<{
		terrainType: TerrainType,
		resourceType: TileResourceType,
		height: number
	}>,
	political: HiddenType<{
		controlledBy: null | {
			country: CountryIdentifier,
			province: ProvinceIdentifier,
			settlement: SettlementIdentifier
		}
	}>,
	createSettlement: {
		settler: boolean,
		direct: boolean
	}
}