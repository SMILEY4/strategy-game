import {
	CountryMessage,
	GameStateMessage,
	ProvinceMessage,
	SettlementMessage,
} from "../gamesession/models/gameStateMessage";
import {ValueHistory} from "../shared/valueHistory";
import {MonitoringRepository} from "../state/database/monitoringRepository";
import {Tile} from "../models/tile";
import {GameRepository} from "./gameRepository";
import {TerrainType} from "../models/TerrainType";
import {TileResourceType} from "../models/TileResourceType";
import {WorldObjectType} from "../models/worldObjectType";
import {WorldObject} from "../models/worldObject";
import {Country} from "../models/country";
import {Visibility} from "../models/visibility";
import {mapHidden} from "../models/hiddenType";
import {Settlement} from "../models/Settlement";
import {Province} from "../models/province";
import {mapValue} from "../shared/utils";

/**
 * Service to handle the start of a new turn
 */
export class TurnStartService {

	private readonly gameRepository: GameRepository;
	private readonly monitoringRepository: MonitoringRepository;
	private readonly durationHistory = new ValueHistory(10);

	constructor(
		gameRepository: GameRepository,
		monitoringRepository: MonitoringRepository,
	) {
		this.gameRepository = gameRepository;
		this.monitoringRepository = monitoringRepository;
	}

	/**
	 * Initialize/Set the current game state data for the start of a new turn.
	 */
	public setGameState(gameState: GameStateMessage) {
		this.monitorSetGameState(() => {
			this.gameRepository.transactionForStartTurn(() => {
				this.gameRepository.clearCommands();
				this.gameRepository.replaceTiles(this.buildTiles(gameState));
				this.gameRepository.replaceWorldObjects(this.buildWorldObjects(gameState));
				this.gameRepository.replaceCountries(this.buildCountries(gameState));
				this.gameRepository.replaceProvinces(this.buildProvinces(gameState));
				this.gameRepository.replaceSettlements(this.buildSettlements(gameState));
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
				color: countryMsg.color
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
					color: provinceMsg.color
				},
				color: provinceMsg.color,
				settlements: provinceMsg.settlements
					.map(settlementId => game.settlements.find(settlementMsg => settlementMsg.id == settlementId)!)
					.map(settlementMsg => ({
						id: settlementMsg.id,
						name: settlementMsg.name,
						color: settlementMsg.color
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
					color: settlementMsg.color
				},
				color: settlementMsg.color,
				country: {
					id: countryMsg.id,
					name: countryMsg.name,
					color: countryMsg.color
				},
				tile: settlementMsg.tile,
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
						color: countryMsg.color
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
						color: countryMsg.color
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