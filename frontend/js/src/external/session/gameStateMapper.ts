import {
	GameStateMessage,
	RealmMessage,
	ResourceTypeMsg,
	TerrainTypeMsg,
	VisibilityMsg,
	WorldObjectTypeGroupMsg,
} from "./gameStateMessage";
import {GameStateContainer} from "../../models/misc/gameStateContainer";
import {Tile} from "../../models/tile/tile";
import {Visibility} from "../../models/misc/visibility";
import {mapHidden} from "../../common/hiddenType";
import {TerrainType} from "../../models/misc/terrainType";
import {Projections} from "../../common/webgl/projections";
import {Realm} from "../../models/realm/realm";
import {WorldObject} from "../../models/worldobject/worldObject";
import {WorldObjectComponent} from "../../models/worldobject/worldObjectComponent";
import {User} from "../../models/misc/userId";
import {TileResourceType} from "../../models/misc/tileResourceType";
import {Color} from "../../common/color/color";

export namespace GameStateMapper {

	export function map(gameStateMsg: GameStateMessage): GameStateContainer {
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

	const worldObjectTypeGroupMapping: Record<WorldObjectTypeGroupMsg, WorldObject.TypeGroup> = {
		"unit": WorldObject.TypeGroup.Unit,
		"tile-improvement": WorldObject.TypeGroup.TileImprovement,
		"settlement": WorldObject.TypeGroup.Settlement,
	};

	function buildTiles(gameStateMsg: GameStateMessage): Tile[] {
		return gameStateMsg.tiles.map(tileMsg => ({
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
			metaProperties: {
				seed: tileMsg.metaProperties.seed,
				worldPosition: Projections.hexToWorld(tileMsg.identifier.q, tileMsg.identifier.r),
			},
		}));
	}

	function buildRealms(gameStateMsg: GameStateMessage): Realm[] {
		return gameStateMsg.realms.map(realmMsg => ({
			id: realmMsg.id as Realm.Id,
			name: realmMsg.name,
			color: Color.rgbByte(
				realmMsg.color.red,
				realmMsg.color.green,
				realmMsg.color.blue,
			),
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
				type: {
					group: worldObjectTypeGroupMapping[worldObjMsg.type.group],
					name: worldObjMsg.type.name,
				},
				realm: {
					id: realmMsg.id as Realm.Id,
					name: realmMsg.name,
					color: Color.rgbByte(
						realmMsg.color.red,
						realmMsg.color.green,
						realmMsg.color.blue,
					),
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
					if (componentMsg.type == "builder") {
						return {
							type: "builder",
							maxUses: componentMsg.maxUses,
							remainingUses: componentMsg.remainingUses,
							options: componentMsg.options,
						} as WorldObjectComponent.Builder;
					}
					if (componentMsg.type == "settlementSpawner") {
						return {
							type: "settlement-spawner",
						} as WorldObjectComponent.SettlementSpawner;
					}

					// exhaustiveness check: syntax error in case of unhandled action type
					// noinspection UnnecessaryLocalVariableJS
					const _exhaustive: never = componentMsg;
					throw new Error("Unexpected component type: " + _exhaustive);
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