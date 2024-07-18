import {SettlementTierString} from "../../../models/settlementTier";
import {BuildingTypeString} from "../../../models/buildingType";
import {ResourceTypeString} from "../../../models/resourceType";
import {BuildingDetailType} from "../../../models/building";
import {PopulationGrowthDetailType} from "../../../models/city";
import {HiddenType} from "../../../models/hiddenType";
import {TileIdentifier} from "../../../models/tile";
import {DetailLogEntry} from "../../../models/detailLogEntry";


export interface GameStateMessage {
	meta: {
		turn: number
	},
	// identifiers: {
	//     countries: Record<string, CountryIdentifier>,
	//     provinces: Record<string, ProvinceIdentifier>,
	//     cities: Record<string, CityIdentifier>,
	// },
	tiles: TileMessage[],
	// countries: CountryMessage[],
	// provinces: ProvinceMessage[],
	// cities: CityMessage[],
	// routes: RouteMessage[]
}


export interface TileMessage {
	identifier: TileIdentifier,
	// visibility: TileVisibilityString,
	// base: {
	//     terrainType: HiddenType<TerrainTypeString>
	//     resourceType: HiddenType<TerrainResourceTypeString>
	// }
	// political: {
	//     owner: HiddenType<null | {
	//         country: string,
	//         province: string,
	//         city: string | null
	//     }>,
	//     influences: HiddenType<{
	//         amount: number
	//         country: string
	//         province: string
	//         city: string
	//     }[]>
	// },
	// objects: HiddenType<TileObjectMessage[]>
}

export interface TileObjectMessage {
	type: "marker" | "scout" | "city",
	country: string
}

export interface MarkerTileObjectMessage extends TileObjectMessage {
	type: "marker",
	label: string
}

export interface ScoutTileObjectMessage extends TileObjectMessage {
	type: "scout";
	creationTurn: number;
}

export interface CityTileObjectMessage extends TileObjectMessage {
	type: "city",
	city: string
}


export interface CountryMessage {
	id: string,
	isPlayerOwned: boolean,
	player: {
		userId: string,
		name: string
	},
	provinces: ProvinceReducedMsg[],
	availableSettlers: HiddenType<number>
}

export interface ProvinceMessage {
	id: string,
	country: string,
	isPlayerOwned: boolean,
	cities: CityReducesMsg[],
	resources: HiddenType<ResourceLedgerEntryMessage[]>
}

export interface ProvinceReducedMsg {
	id: string,
	cities: CityReducesMsg[]
}

export interface CityMessage {
	id: string,
	country: string,
	province: string,
	tile: TileIdentifier,
	isPlayerOwned: boolean,
	isProvinceCapital: boolean,
	tier: SettlementTierString,
	infrastructure: {
		buildings: HiddenType<({
			type: BuildingTypeString,
			active: boolean,
			tile: null | TileIdentifier,
			details: DetailLogEntryMessage<BuildingDetailType>[]
		})[]>,
		productionQueue: HiddenType<({
			type: "building" | "settler"
			entryId: string,
			progress: number,
			buildingType: undefined | BuildingTypeString
		})[]>
	},
	population: {
		size: HiddenType<number>,
		growth: HiddenType<{
			progress: number,
			details: DetailLogEntryMessage<PopulationGrowthDetailType>[]
		}>
	},
	connectedCities: ({
		city: string,
		route: string,
		distance: number
	})[]
}

export interface CityReducesMsg {
	id: string,
	isProvinceCapitol: boolean
}

export interface RouteMessage {
	id: string,
	cityA: HiddenType<string>,
	cityB: HiddenType<string>,
	path: TileIdentifier[]
}


export interface ResourceLedgerEntryMessage {
	type: ResourceTypeString,
	amount: number,
	missing: number,
	details: DetailLogEntry<ResourceLedgerDetailTypeMessage>[]
}

export interface DetailLogEntryMessage<T> {
	id: T,
	data: Record<string, DetailValueMessage>
}

export interface DetailValueMessage {
	type: string,
	value: any
}

export type  ResourceLedgerDetailTypeMessage =
	"UNKNOWN_CONSUMPTION"
	| "UNKNOWN_PRODUCTION"
	| "UNKNOWN_MISSING"
	| "BUILDING_CONSUMPTION"
	| "BUILDING_PRODUCTION"
	| "BUILDING_MISSING"
	| "POPULATION_BASE_CONSUMPTION"
	| "POPULATION_BASE_MISSING"
	| "POPULATION_GROWTH_CONSUMPTION"
	| "POPULATION_GROWTH_MISSING"
	| "PRODUCTION_QUEUE_CONSUMPTION"
	| "PRODUCTION_QUEUE_MISSING"
	| "PRODUCTION_QUEUE_REFUND"
	| "SHARED_GIVE"
	| "SHARED_TAKE"


//===================================================

//
//
// export interface ResourceLedgerDTO {
//     entries: ResourceLedgerEntryDTO[];
// }
//
// export interface ResourceLedgerEntryDTO {
//     resourceType: ResourceTypeString,
//     amount: number,
//     missing: number,
//     details: DetailLogEntryMessage<ResourceLedgerDetailTypeMessage>[]
// }
//
//
// export interface CityDTO {
//     dataTier1: {
//         id: string,
//         name: string,
//         color: ColorDTO,
//         countryId: string,
//         isCountryCapital: boolean,
//         isProvinceCapital: boolean,
//         tile: {
//             tileId: string,
//             q: number,
//             r: number,
//         },
//         tier: SettlementTierString
//     },
//     dataTier3: null | {
//         buildings: BuildingDTO[],
//         productionQueue: ProductionQueueEntryDTO[],
//         size: number,
//         growthProgress: number,
//         growthDetails: DetailLogEntryMessage<PopulationGrowthDetailType>[]
//     }
// }
//
// export interface BuildingDTO {
//     type: BuildingTypeString,
//     tile: null | {
//         tileId: string,
//         q: number,
//         r: number,
//     },
//     active: boolean,
//     details: DetailLogEntryMessage<BuildingDetailType>[]
// }
//
// export interface ProductionQueueEntryDTO {
//     entryId: string,
//     progress: number,
//     type: "building" | "settler",
//     buildingType: null | BuildingTypeString
// }
//
// export interface TileDTO {
//     dataTier0: {
//         tileId: string,
//         position: {
//             q: number,
//             r: number
//         },
//         visibility: VisibilityString
//     },
//     dataTier1: null | {
//         terrainType: TerrainTypeString,
//         resourceType: "NONE" | TerrainResourceTypeString,
//         owner: null | {
//             countryId: string,
//             provinceId: string,
//             cityId: string | null
//         }
//     },
//     dataTier2: null | {
//         influences: ({
//             countryId: string,
//             provinceId: string,
//             cityId: string,
//             amount: number
//         })[],
//         objects: TileObjectMessage[]
//     }
// }
//
//
// export interface RouteDTO {
//     routeId: string,
//     cityIdA: string,
//     cityIdB: string,
//     path: ({
//         tileId: string,
//         q: number,
//         r: number,
//     })[]
// }
//
// export interface ColorDTO {
//     red: number,
//     green: number,
//     blue: number,
// }
//

