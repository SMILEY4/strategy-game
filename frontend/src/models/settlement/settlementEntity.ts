import {CountryIdentifier} from "../base/country";
import {TileIdentifier} from "../base/tile";
import {HiddenType} from "../../common/hiddenType";
import {Color} from "../base/color";
import {TerrainType} from "../base/TerrainType";
import {TileResourceType} from "../base/TileResourceType";

export interface SettlementEntity {
	id: string,
	name: string
	color: Color,
	country: CountryIdentifier
	tile: TileIdentifier,
	population: SettlementPopulationEntity,
	productionQueue: HiddenType<ProductionQueueEntryEntity[]>,
	productionOptions: HiddenType<ProductionOptionEntity[]>,
	buildings: HiddenType<BuildingEntity[]>
	resources: HiddenType<SettlementResourceEntity[]>
}

export interface SettlementPopulationEntity {
	size: number,
	growth: HiddenType<({
		progress: number,
		amount: number,
		details: ({
			key: string,
			amount: number
		})[]
	})>,
}

export interface ProductionQueueEntryEntity {
	type: string,
	entryId: string,
	progress: number,
}

export interface ProductionOptionEntity {
	type: string,
	availableTiles: number,
	requiresTile: boolean
}

export interface BuildingEntity {
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

export interface SettlementResourceEntity {
	type: string,
	amount: number,
	produced: {
		amount: number,
		details: ({ key: string, amount: number })[]
	},
	consumed: {
		amount: number,
		details: ({ key: string, amount: number })[]
	},
	missing: {
		amount: number,
		details: ({ key: string, amount: number })[]
	},
}