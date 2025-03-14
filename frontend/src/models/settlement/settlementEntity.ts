import {HiddenType} from "../../common/hiddenType";
import {Color} from "../../common/color";
import {TerrainType} from "../tile/TerrainType";
import {TileResourceType} from "../tile/TileResourceType";
import {CountrySummary} from "../country/countrySummary";
import {SettlementId} from "./settlementId";
import {TileSummary} from "../tile/tileSummary";

export interface SettlementEntity {
	id: SettlementId,
	name: string
	color: Color,
	country: CountrySummary
	tile: TileSummary,
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
		tile: TileSummary | null
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