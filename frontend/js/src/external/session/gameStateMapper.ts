import {GameStateMessage, RealmMessage} from "./gameStateMessage";
import {GameState} from "../../models/misc/gameState";
import {TileEntity} from "../../models/tile/tileEntity";
import {shuffleArray} from "../../common/utils";
import {Visibility} from "../../models/misc/visibility";
import {mapHidden} from "../../common/hiddenType";
import {TerrainType} from "../../models/tile/terrainType";
import {TileResourceType} from "../../models/tile/TileResourceType";
import {Projections} from "../../common/webgl/projections";
import {RealmEntity} from "../../models/realm/realmEntity";
import {WorldObjectEntity} from "../../models/worldobject/worldObjectEntity";
import {WorldObjectComponent} from "../../models/worldobject/worldObjectComponent";
import {Random} from "../../common/random";
import normalized = Random.normalized;

export namespace GameStateMapper {

	let cachedTileIndices: number[] = [];

	export function map(gameStateMsg: GameStateMessage): GameState {
		cachedTileIndices = [];
		return {
			turn: gameStateMsg.game.turn,
			commands: [],
			tiles: buildTiles(gameStateMsg),
			realms: buildRealms(gameStateMsg),
			worldObjects: buildWorldObjects(gameStateMsg),
		};
	}

	function buildTiles(gameStateMsg: GameStateMessage): TileEntity[] {
		if (cachedTileIndices.length != gameStateMsg.tiles.length) {
			const indices = [...Array(gameStateMsg.tiles.length).keys()];
			shuffleArray(indices);
			cachedTileIndices = indices;
		}
		return gameStateMsg.tiles.map((tileMsg, index) => ({
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
			metaProperties: { // todo: read from backend to make stable
				worldPosition: Projections.hexToWorld(tileMsg.identifier.q, tileMsg.identifier.r),
				randomIndex: cachedTileIndices[index],
				randomValue0: normalized(tileMsg.identifier.r + "-" + tileMsg.identifier.q + "-1"),
				randomValue1: normalized(tileMsg.identifier.r + "-" + tileMsg.identifier.q + "-2"),
				randomValue2: normalized(tileMsg.identifier.r + "-" + tileMsg.identifier.q + "-2"),
			},
		}));
	}

	function buildRealms(gameStateMsg: GameStateMessage): RealmEntity[] {
		return gameStateMsg.realms.map(realmMsg => ({
			id: realmMsg.id,
			name: realmMsg.name,
			color: realmMsg.color,
			ownedByUser: realmMsg.ownedByUser,
			player: {
				userId: realmMsg.player.userId,
				name: realmMsg.player.name,
			},
		}));
	}

	function buildWorldObjects(gameStateMsg: GameStateMessage): WorldObjectEntity[] {
		return gameStateMsg.worldObjects.map(worldObjMsg => {
			const realmMsg = findRealmById(gameStateMsg, worldObjMsg.realm.id);
			return {
				id: worldObjMsg.id,
				type: worldObjMsg.type,
				realm: {
					id: realmMsg.id,
					name: realmMsg.name,
					color: realmMsg.color,
					ownedByUser: realmMsg.ownedByUser,
					playerName: realmMsg.player.name,
				},
				tile: {
					id: worldObjMsg.tile.id,
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
						} as WorldObjectComponent.Move;
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