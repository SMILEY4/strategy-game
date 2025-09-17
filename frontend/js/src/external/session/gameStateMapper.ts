import {GameStateMessage, RealmMessage, ResourceTypeMsg, TerrainTypeMsg, VisibilityMsg} from "./gameStateMessage";
import {GameStateContainer} from "../../models/misc/gameStateContainer";
import {Tile} from "../../models/tile/tile";
import {shuffleArray} from "../../common/utils";
import {Visibility} from "../../models/misc/visibility";
import {mapHidden} from "../../common/hiddenType";
import {TerrainType} from "../../models/misc/terrainType";
import {Projections} from "../../common/webgl/projections";
import {Realm} from "../../models/realm/realm";
import {WorldObject} from "../../models/worldobject/worldObject";
import {WorldObjectComponent} from "../../models/worldobject/worldObjectComponent";
import {Random} from "../../common/random";
import {User} from "../../models/misc/userId";
import {TileResourceType} from "../../models/misc/tileResourceType";
import normalized = Random.normalized;

export namespace GameStateMapper {

	let cachedTileIndices: number[] = [];

	export function map(gameStateMsg: GameStateMessage): GameStateContainer {
		cachedTileIndices = [];
		return {
			turn: gameStateMsg.game.turn,
			commands: [],
			tiles: buildTiles(gameStateMsg),
			realms: buildRealms(gameStateMsg),
			worldObjects: buildWorldObjects(gameStateMsg),
		};
	}

	const visibilityMapping: Record<VisibilityMsg, Visibility> = {
		"UNKNOWN": Visibility.UNKNOWN,
		"DISCOVERED": Visibility.DISCOVERED,
		"VISIBLE": Visibility.VISIBLE,
	};

	const terrainTypeMapping: Record<TerrainTypeMsg, TerrainType> = {
		"LAND": TerrainType.LAND,
		"WATER": TerrainType.WATER,
	};

	const resourceTypeMapping: Record<ResourceTypeMsg, TileResourceType> = {
		"NONE": TileResourceType.NONE,
		"WOOD": TileResourceType.WOOD,
		"FISH": TileResourceType.FISH,
		"STONE": TileResourceType.STONE,
		"METAL": TileResourceType.METAL,
	};

	function buildTiles(gameStateMsg: GameStateMessage): Tile[] {
		if (cachedTileIndices.length != gameStateMsg.tiles.length) {
			const indices = [...Array(gameStateMsg.tiles.length).keys()];
			shuffleArray(indices);
			cachedTileIndices = indices;
		}
		return gameStateMsg.tiles.map((tileMsg, index) => ({
			id: tileMsg.identifier.id as Tile.Id,
			position: {
				q: tileMsg.identifier.q,
				r: tileMsg.identifier.r,
			},
			visibility: visibilityMapping[tileMsg.visibility],
			base: mapHidden(tileMsg.base, baseMsg => ({
				terrainType: terrainTypeMapping[baseMsg.terrainType],
				resourceType: resourceTypeMapping[baseMsg.resourceType],
				height: baseMsg.height,
			})),
			metaProperties: { // todo: read from backend to make stable
				worldPosition: Projections.hexToWorld(tileMsg.identifier.q, tileMsg.identifier.r),
				randomIndex: cachedTileIndices[index],
				randomValue0: normalized(tileMsg.identifier.r + "-" + tileMsg.identifier.q + "-1"),
				randomValue1: normalized(tileMsg.identifier.r + "-" + tileMsg.identifier.q + "-2"),
				randomValue2: normalized(tileMsg.identifier.r + "-" + tileMsg.identifier.q + "-2"),
			},
		}));
	}

	function buildRealms(gameStateMsg: GameStateMessage): Realm[] {
		return gameStateMsg.realms.map(realmMsg => ({
			id: realmMsg.id as Realm.Id,
			name: realmMsg.name,
			color: realmMsg.color,
			ownedByUser: realmMsg.ownedByUser,
			player: {
				userId: realmMsg.player.userId as User.Id,
				name: realmMsg.player.name,
			},
		}));
	}

	function buildWorldObjects(gameStateMsg: GameStateMessage): WorldObject[] {
		return gameStateMsg.worldObjects.map(worldObjMsg => {
			const realmMsg = findRealmById(gameStateMsg, worldObjMsg.realm.id);
			return {
				id: worldObjMsg.id as WorldObject.Id,
				type: worldObjMsg.type,
				realm: {
					id: realmMsg.id as Realm.Id,
					name: realmMsg.name,
					color: realmMsg.color,
					ownedByUser: realmMsg.ownedByUser,
					playerName: realmMsg.player.name,
				},
				tile: {
					id: worldObjMsg.tile.id as Tile.Id,
					position: {
						q: worldObjMsg.tile.q,
						r: worldObjMsg.tile.r,
					},
				},
				components: worldObjMsg.components.map(componentMsg => {
					if (componentMsg.type == "movement") {
						return {
							type: "movement",
							maxMovement: componentMsg.maxMovement,
						} as WorldObjectComponent.Movement;
					}
					if (componentMsg.type == "vision") {
						return {
							type: "vision",
							radius: componentMsg.radius,
						} as WorldObjectComponent.Vision;
					}
					throw new Error("Unexpected component type");
				}),
			};
		});
	}

	function findRealmById(gameStateMsg: GameStateMessage, id: string): RealmMessage {
		const result = gameStateMsg.realms.find(it => it.id === id);
		if (!result) {
			throw new Error("Could not find realm with id '" + id + "'");
		}
		return result;
	}

}