import {
	CountryMessage,
	GameStateMessage,
	SettlementMessage,
	WorldObjectMessage,
} from "../session/models/gameStateMessage";
import {TileResourceType} from "../../models/tile/TileResourceType";
import {WorldObjectType} from "../../models/worldobject/worldObjectType";
import {Visibility} from "../../models/misc/visibility";
import {mapHidden} from "../../common/hiddenType";
import {mapValue} from "../../common/utils";
import {GameStateWriter} from "../../state/gameStateWriter";
import {TileEntity} from "../../models/tile/tileEntity";
import {TerrainType} from "../../models/tile/terrainType";
import {CountryEntity} from "../../models/country/countryEntity";
import {SettlementEntity} from "../../models/settlement/settlementEntity";
import {WorldObjectEntity} from "../../models/worldobject/worldObjectEntity";
import {RouteEntity} from "../../models/route/routeEntity";

export interface TurnStartService {
	setGameState(gameState: GameStateMessage): void;
}

export class TurnStartServiceImpl implements TurnStartService {

	private readonly gameStateWriter: GameStateWriter;

	constructor(gameStateWriter: GameStateWriter) {
		this.gameStateWriter = gameStateWriter;
	}

	setGameState(gameState: GameStateMessage) {
		this.gameStateWriter.replaceGameState({
			commands: [],
			tiles: this.buildTiles(gameState),
			countries: this.buildCountries(gameState),
			settlements: this.buildSettlements(gameState),
			worldObjects: this.buildWorldObjects(gameState),
			routes: this.buildRoutes(gameState),
		});
	}

	private buildTiles(game: GameStateMessage): TileEntity[] {
		return game.tiles.map(tileMsg => ({
			id: tileMsg.identifier.id,
			position: {
				q: tileMsg.identifier.q,
				r: tileMsg.identifier.r,
			},
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
						isUserControlled: country.ownedByUser,
						playerName: country.player.name
					})),
					settlement: mapValue(this.findSettlementById(game, politicalMsg.controlledBy.settlement), settlement => ({
						id: settlement.id,
						name: settlement.name,
						color: settlement.color,
						isUserControlled: this.findCountryById(game, settlement.country).ownedByUser
					})),
				} : null,
			})),
			isValidSettlementLocation: tileMsg.createSettlement,
			objects: [
				...game.settlements
					.filter(it => it.tile.id === tileMsg.identifier.id)
					.map(it => [it, this.findCountryById(game, it.country)])
					.map(it => ({
						settlement: {
							id: (it[0] as SettlementMessage).id,
							name: (it[0] as SettlementMessage).name,
							color: (it[0] as SettlementMessage).color,
							isUserControlled: (it[1] as CountryMessage).ownedByUser
						},
						worldObject: null,
						country: {
							id: (it[1] as CountryMessage).id,
							name: (it[1] as CountryMessage).name,
							color: (it[1] as CountryMessage).color,
							isUserControlled: (it[1] as CountryMessage).ownedByUser,
							playerName: (it[1] as CountryMessage).player.name
						},
					})),
				...game.worldObjects
					.filter(it => it.tile.id === tileMsg.identifier.id)
					.map(it => [it, this.findCountryById(game, it.country)])
					.map(it => ({
						settlement: null,
						worldObject: {
							id: (it[0] as WorldObjectMessage).id,
							type: WorldObjectType.fromString((it[0] as WorldObjectMessage).type),
							isUserControlled: (it[1] as CountryMessage).ownedByUser,
							tile: {
								id: (it[0] as WorldObjectMessage).tile.id,
								position: {
									q: (it[0] as WorldObjectMessage).tile.q,
									r: (it[0] as WorldObjectMessage).tile.r
								}
							},
							country: {
								id: (it[1] as CountryMessage).id,
								name: (it[1] as CountryMessage).name,
								color: (it[1] as CountryMessage).color,
								isUserControlled: (it[1] as CountryMessage).ownedByUser,
								playerName: (it[1] as CountryMessage).player.name
							},
							maxMovementPoints: (it[0] as WorldObjectMessage).maxMovement
						},
						country: {
							id: (it[1] as CountryMessage).id,
							name: (it[1] as CountryMessage).name,
							color: (it[1] as CountryMessage).color,
							isUserControlled: (it[1] as CountryMessage).ownedByUser,
							playerName: (it[1] as CountryMessage).player.name
						},
					})),
			],
		}));
	}

	private buildCountries(game: GameStateMessage): CountryEntity[] {
		return game.countries.map(countryMsg => ({
			id: countryMsg.id,
			name: countryMsg.name,
			color: countryMsg.color,
			isUserControlled: countryMsg.ownedByUser,
			player: {
				userId: countryMsg.player.userId,
				name: countryMsg.player.name,
			},
		}));
	}

	private buildSettlements(game: GameStateMessage): SettlementEntity[] {
		return game.settlements.map(settlementMsg => {
			const countryMsg = this.findCountryById(game, settlementMsg.country);
			return {
				id: settlementMsg.id,
				name: settlementMsg.name,
				color: settlementMsg.color,
				country: {
					id: countryMsg.id,
					name: countryMsg.name,
					color: countryMsg.color,
					isUserControlled: countryMsg.ownedByUser,
					playerName: countryMsg.player.name,
				},
				tile: {
					id: settlementMsg.tile.id,
					position: {
						q: settlementMsg.tile.q,
						r: settlementMsg.tile.r,
					},
				},
				population: {
					size: settlementMsg.population.size,
					growth: settlementMsg.population.growth,
				},
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
					workTile: {
						requiredTerrain: buildingMsg.workTile.requiredTerrain == null ? null : TerrainType.fromString(buildingMsg.workTile.requiredTerrain),
						requiredResource: buildingMsg.workTile.requiredResource == null ? null : TileResourceType.fromString(buildingMsg.workTile.requiredResource),
						tile: buildingMsg.workTile.tile
							? ({
								id: buildingMsg.workTile.tile.id,
								position: {
									q: buildingMsg.workTile.tile.q,
									r: buildingMsg.workTile.tile.r,
								},
							})
							: null,
					},
					validity: buildingMsg.validity,
					activity: buildingMsg.activity,
				}))),
				resources: mapHidden(settlementMsg.resources, resourcesMsg => resourcesMsg),
			};
		});
	}

	private buildWorldObjects(game: GameStateMessage): WorldObjectEntity[] {
		return game.worldObjects.map(worldObjMsg => {
			const countryMsg = this.findCountryById(game, worldObjMsg.country);
			if (worldObjMsg.type === "scout") {
				return {
					id: worldObjMsg.id,
					type: WorldObjectType.SCOUT,
					tile: {
						id: worldObjMsg.tile.id,
						position: {
							q: worldObjMsg.tile.q,
							r: worldObjMsg.tile.r,
						},
					},
					country: {
						id: countryMsg.id,
						name: countryMsg.name,
						color: countryMsg.color,
						isUserControlled: countryMsg.ownedByUser,
						playerName: countryMsg.player.name,
					},
					maxMovementPoints: worldObjMsg.maxMovement,
				} as WorldObjectEntity;
			}
			if (worldObjMsg.type === "settler") {
				return {
					id: worldObjMsg.id,
					type: WorldObjectType.SETTLER,
					tile: {
						id: worldObjMsg.tile.id,
						position: {
							q: worldObjMsg.tile.q,
							r: worldObjMsg.tile.r,
						},
					},
					country: {
						id: countryMsg.id,
						name: countryMsg.name,
						color: countryMsg.color,
						isUserControlled: countryMsg.ownedByUser,
						playerName: countryMsg.player.name,
					},
					maxMovementPoints: worldObjMsg.maxMovement,
				} as WorldObjectEntity;
			}
			return null;
		}).filterDefined();
	}

	private buildRoutes(game: GameStateMessage): RouteEntity[] {
		return game.routes.map(routeMsg => {
			const settlementA = this.findSettlementById(game, routeMsg.settlementA);
			const settlementB = this.findSettlementById(game, routeMsg.settlementB);
			const countryA = this.findCountryById(game, settlementA.country)
			const countryB = this.findCountryById(game, settlementB.country)
			return {
				id: routeMsg.id,
				settlementA: {
					id: settlementA.id,
					name: settlementA.name,
					color: settlementA.color,
					isUserControlled: countryA.ownedByUser
				},
				settlementB: {
					id: settlementB.id,
					name: settlementB.name,
					color: settlementB.color,
					isUserControlled: countryB.ownedByUser
				},
				path: routeMsg.path.map(tileMsg => ({
					id: tileMsg.id,
					position: {
						q: tileMsg.q,
						r: tileMsg.r,
					},
				})),
			};
		});
	}

	private findCountryById(game: GameStateMessage, id: string): CountryMessage {
		const result = game.countries.find(it => it.id === id);
		if (!result) {
			throw new Error("Could not find country with id '" + id + "'");
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