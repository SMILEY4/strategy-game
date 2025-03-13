import {Visibility} from "../../models/base/visibility";
import {HiddenType} from "../../common/hiddenType";
import {TerrainType} from "../../models/base/TerrainType";
import {TileResourceType} from "../../models/base/TileResourceType";
import {CountryIdentifier} from "../../models/base/country";
import {SettlementIdentifier} from "../../models/base/Settlement";
import {TileObject} from "../../models/base/tile";

export interface LocalTileIdentifier {
	id: string,
	q: number,
	r: number,
}

export interface LocalTile {
	identifier: LocalTileIdentifier,
	visibility: Visibility
	base: HiddenType<{
		terrainType: TerrainType,
		resourceType: TileResourceType,
		height: number
	}>,
	political: HiddenType<{
		controlledBy: null | {
			country: CountryIdentifier,
			settlement: SettlementIdentifier
		}
	}>,
	isValidSettlementLocation: boolean,
	isSelected: boolean,
	objects: TileObject[]
}