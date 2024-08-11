import {GameStateMessage} from "../gamesession/models/gameStateMessage";
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
				this.gameRepository.replaceCountries(this.buildCountries(gameState))
				this.gameRepository.replaceSettlements(this.buildSettlements(gameState))
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
				height: baseMsg.height
			}))
		}))
	}

	private buildCountries(game: GameStateMessage): Country[] {
		return game.countries.map(countryMsg => ({
			identifier: {
				id: countryMsg.id,
				name: countryMsg.name,
			},
			player: {
				userId: countryMsg.player.userId,
				name: countryMsg.player.name,
			},
			ownedByPlayer: countryMsg.ownedByUser
		}));
	}

	private buildSettlements(game: GameStateMessage): Settlement[] {
		return game.settlements.map(settlementMsg => {
			const countryMsg = game.countries.find(it => it.id === settlementMsg.country)!
			return {
				identifier: {
					id: settlementMsg.id,
					name: settlementMsg.name,
				},
				country: {
					id: countryMsg.id,
					name: countryMsg.name
				},
				tile: settlementMsg.tile
			}
		})
	}

	private buildWorldObjects(game: GameStateMessage): WorldObject[] {
		return game.worldObjects.map(worldObjMsg => {
			const countryMsg = game.countries.find(it => it.id === worldObjMsg.country)!
			if (worldObjMsg.type === "scout") {
				return {
					id: worldObjMsg.id,
					type: WorldObjectType.SCOUT,
					tile: worldObjMsg.tile,
					country: {
						id: countryMsg.id,
						name: countryMsg.name,
					},
					movementPoints: worldObjMsg.maxMovement,
					ownedByPlayer: countryMsg.ownedByUser
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
					},
					movementPoints: worldObjMsg.maxMovement,
					ownedByPlayer: countryMsg.ownedByUser
				};
			}
			return null;
		}).filterDefined();
	}

}