import {
	RealmMessage,
	GameStateMessage,
} from "../../../models/messages/gameStateMessage";
import {TileResourceType} from "../../../models/tile/TileResourceType";
import {Visibility} from "../../../models/misc/visibility";
import {mapHidden} from "../../../common/hiddenType";
import {shuffleArray} from "../../../common/utils";
import {GameStateWriter} from "../../../state/gameStateWriter";
import {TileEntity} from "../../../models/tile/tileEntity";
import {TerrainType} from "../../../models/tile/terrainType";
import {RealmEntity} from "../../../models/realm/realmEntity";
import {WorldObjectEntity} from "../../../models/worldobject/worldObjectEntity";
import {Projections} from "../../../common/webgl/projections";
import {Random} from "../../../common/random";
import normalized = Random.normalized;
import {WorldObjectComponent} from "../../../models/worldobject/worldObjectComponent";
import {Color} from "../../../common/color";

export interface TurnStartService {
	/**
	 * Start a new turn and set the new game state
	 */
	setGameState(gameState: GameStateMessage): void;
}

export class TurnStartServiceImpl implements TurnStartService {

	private readonly gameStateWriter: GameStateWriter;

	private cachedTileIndices: number[] = [];

	constructor(gameStateWriter: GameStateWriter) {
		this.gameStateWriter = gameStateWriter;
	}

	setGameState(gameState: GameStateMessage) {
		this.gameStateWriter.replaceGameState({
			commands: [],
			tiles: this.buildTiles(gameState),
			realms: this.buildRealms(gameState),
			worldObjects: this.buildWorldObjects(gameState),
		});
	}

	private buildTiles(game: GameStateMessage): TileEntity[] {
		if(this.cachedTileIndices.length != game.tiles.length) {
			const indices = [...Array(game.tiles.length).keys()];
			shuffleArray(indices);
			this.cachedTileIndices = indices;
		}
		return game.tiles.map((tileMsg, index) => ({
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
				randomIndex: this.cachedTileIndices[index],
				randomValue0: normalized(tileMsg.identifier.r + "-" + tileMsg.identifier.q + "-1"),
				randomValue1: normalized(tileMsg.identifier.r + "-" + tileMsg.identifier.q + "-2"),
				randomValue2: normalized(tileMsg.identifier.r + "-" + tileMsg.identifier.q + "-2"),
			}
		}));
	}

	private buildRealms(game: GameStateMessage): RealmEntity[] {
		return game.realms.map(realmMsg => ({
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

	private buildWorldObjects(game: GameStateMessage): WorldObjectEntity[] {
		return game.worldObjects.map(worldObjMsg => {
			const realmMsg = this.findRealmById(game, worldObjMsg.realm.id);
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
						r: worldObjMsg.tile.r
					}
				},
				components: worldObjMsg.components.map(componentMsg => {
					if(componentMsg.type == "movement") {
						return {
							type: "movement",
							maxMovement: componentMsg.maxMovement
						} as WorldObjectComponent.Move
					}
					if(componentMsg.type == "vision") {
						return {
							type: "vision",
							radius: componentMsg.radius,
						} as WorldObjectComponent.Vision
					}
					throw new Error("Unexpected component type")
				})
			}
		})
	}

	private findRealmById(game: GameStateMessage, id: string): RealmMessage {
		const result = game.realms.find(it => it.id === id);
		if (!result) {
			throw new Error("Could not find realm with id '" + id + "'");
		}
		return result;
	}

}