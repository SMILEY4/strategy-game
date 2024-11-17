import {
	CountryMessage,
	GameStateMessage,
	ProvinceMessage,
	SettlementMessage,
} from "../gamesession/models/gameStateMessage";
import {ValueHistory} from "../../common/valueHistory";
import {MonitoringRepository} from "../../state/repository/monitoringRepository";
import {Tile} from "../../models/base/tile";
import {TerrainType} from "../../models/base/TerrainType";
import {TileResourceType} from "../../models/base/TileResourceType";
import {WorldObjectType} from "../../models/base/worldObjectType";
import {WorldObject} from "../../models/base/worldObject";
import {Country} from "../../models/base/country";
import {Visibility} from "../../models/base/visibility";
import {mapHidden} from "../../common/hiddenType";
import {Settlement} from "../../models/base/Settlement";
import {Province} from "../../models/base/province";
import {mapValue} from "../../common/utils";
import {TurnRepository} from "../../state/repository/turnRepository";
import {CommandRepository} from "../../state/repository/commandRepository";

/**
 * Service to handle the start of a new turn
 */
export class TurnStartService {

	private readonly monitoringRepository: MonitoringRepository;
	private readonly durationHistory = new ValueHistory(10);
	private readonly turnRepository: TurnRepository;
	private readonly commandRepository: CommandRepository;

	constructor(
		monitoringRepository: MonitoringRepository,
		turnRepository: TurnRepository,
		commandRepository: CommandRepository,
	) {
		this.turnRepository = turnRepository;
		this.monitoringRepository = monitoringRepository;
		this.commandRepository = commandRepository;
	}

	/**
	 * Initialize/Set the current game state data for the start of a new turn.
	 */
	public setGameState(gameState: GameStateMessage) {
		this.monitorSetGameState(() => {
			this.turnRepository.transactionForStartTurn(() => {
				this.commandRepository.clear();
				this.turnRepository.replaceTiles(this.buildTiles(gameState));
				this.turnRepository.replaceWorldObjects(this.buildWorldObjects(gameState));
				this.turnRepository.replaceCountries(this.buildCountries(gameState));
				this.turnRepository.replaceProvinces(this.buildProvinces(gameState));
				this.turnRepository.replaceSettlements(this.buildSettlements(gameState));
			});
		});
	}

	private monitorSetGameState(action: () => void) {
		const timeStart = Date.now();

		action();

		const timeEnd = Date.now();
		this.durationHistory.set(timeEnd - timeStart);
		this.monitoringRepository.setNextTurnDurations(this.durationHistory.getHistory());
	}

	private buildTiles(game: GameStateMessage): Tile[] {
		return game.tiles.map(tileMsg => ({
			identifier: tileMsg.identifier,
			visibility: Visibility.fromString(tileMsg.visibility),
			base: mapHidden(tileMsg.base, baseMsg => ({
				terrainType: TerrainType.fromString(baseMsg.terrainType),
				resourceType: TileResourceType.fromString(baseMsg.resourceType),
				height: baseMsg.height,
			})),
			political: mapHidden(tileMsg.political, politicalMsg => ({
				controlledBy: politicalMsg.controlledBy ? {
					country: mapValue(this.findCountryById(game, politicalMsg.controlledBy.country), country => ({
						id: country.id,
						name: country.name,
						color: country.color,
					})),
					province: mapValue(this.findProvinceById(game, politicalMsg.controlledBy.province), province => ({
						id: province.id,
						color: province.color,
					})),
					settlement: mapValue(this.findSettlementById(game, politicalMsg.controlledBy.settlement), settlement => ({
						id: settlement.id,
						name: settlement.name,
						color: settlement.color,
					})),
				} : null,
			})),
			createSettlement: {
				settler: tileMsg.createSettlement.settler,
				direct: tileMsg.createSettlement.direct,
			},
		}));
	}

	private buildCountries(game: GameStateMessage): Country[] {
		return game.countries.map(countryMsg => ({
			identifier: {
				id: countryMsg.id,
				name: countryMsg.name,
				color: countryMsg.color,
			},
			color: countryMsg.color,
			player: {
				userId: countryMsg.player.userId,
				name: countryMsg.player.name,
			},
			ownedByPlayer: countryMsg.ownedByUser,
		}));
	}

	private buildProvinces(game: GameStateMessage): Province[] {
		return game.provinces.map(provinceMsg => {
			return {
				identifier: {
					id: provinceMsg.id,
					color: provinceMsg.color,
				},
				color: provinceMsg.color,
				settlements: provinceMsg.settlements
					.map(settlementId => game.settlements.find(settlementMsg => settlementMsg.id == settlementId)!)
					.map(settlementMsg => ({
						id: settlementMsg.id,
						name: settlementMsg.name,
						color: settlementMsg.color,
					})),
			};
		});
	}

	private buildSettlements(game: GameStateMessage): Settlement[] {
		return game.settlements.map(settlementMsg => {
			const countryMsg = this.findCountryById(game, settlementMsg.country);
			return {
				identifier: {
					id: settlementMsg.id,
					name: settlementMsg.name,
					color: settlementMsg.color,
				},
				color: settlementMsg.color,
				country: {
					id: countryMsg.id,
					name: countryMsg.name,
					color: countryMsg.color,
				},
				tile: settlementMsg.tile,
				productionQueue: mapHidden(settlementMsg.productionQueue, productionQueueMsg => productionQueueMsg.map(entryMsg => ({
					type: entryMsg.type,
					entryId: entryMsg.entryId,
					progress: entryMsg.progress,
				}))),
				productionOptions: mapHidden(settlementMsg.productionOptions, optionsMsg => optionsMsg.map(optionMsg => ({
					type: optionMsg.type,
					availableTiles: optionMsg.availableTiles === null ? 0 : optionMsg.availableTiles,
					requiresTile: optionMsg.availableTiles !== null,
				}))),
				buildings: mapHidden(settlementMsg.buildings, buildingsMsg => buildingsMsg.map(buildingMsg => ({
					type: buildingMsg.type,
					validity: buildingMsg.validity,
					workTile: {
						requiredTerrain: buildingMsg.workTile.requiredTerrain == null ? null : TerrainType.fromString(buildingMsg.workTile.requiredTerrain),
						requiredResource: buildingMsg.workTile.requiredResource == null ? null : TileResourceType.fromString(buildingMsg.workTile.requiredResource),
						tile: buildingMsg.workTile.tile,
					},
					activity: buildingMsg.activity,
				}))),
				resources: mapHidden(settlementMsg.resources, resourcesMsg => resourcesMsg),
			};
		});
	}

	private buildWorldObjects(game: GameStateMessage): WorldObject[] {
		return game.worldObjects.map(worldObjMsg => {
			const countryMsg = this.findCountryById(game, worldObjMsg.country);
			if (worldObjMsg.type === "scout") {
				return {
					id: worldObjMsg.id,
					type: WorldObjectType.SCOUT,
					tile: worldObjMsg.tile,
					country: {
						id: countryMsg.id,
						name: countryMsg.name,
						color: countryMsg.color,
					},
					movementPoints: worldObjMsg.maxMovement,
					ownedByPlayer: countryMsg.ownedByUser,
				};
			}
			if (worldObjMsg.type === "settler") {
				return {
					id: worldObjMsg.id,
					type: WorldObjectType.SETTLER,
					tile: worldObjMsg.tile,
					country: {
						id: countryMsg.id,
						name: countryMsg.name,
						color: countryMsg.color,
					},
					movementPoints: worldObjMsg.maxMovement,
					ownedByPlayer: countryMsg.ownedByUser,
				};
			}
			return null;
		}).filterDefined();
	}

	private findCountryById(game: GameStateMessage, id: string): CountryMessage {
		const result = game.countries.find(it => it.id === id);
		if (!result) {
			throw new Error("Could not find country with id '" + id + "'");
		}
		return result;
	}

	private findProvinceById(game: GameStateMessage, id: string): ProvinceMessage {
		const result = game.provinces.find(it => it.id === id);
		if (!result) {
			throw new Error("Could not find province with id '" + id + "'");
		}
		return result;
	}

	private findSettlementById(game: GameStateMessage, id: string): SettlementMessage {
		const result = game.settlements.find(it => it.id === id);
		if (!result) {
			throw new Error("Could not find settlement with id '" + id + "'");
		}
		return result;
	}

}