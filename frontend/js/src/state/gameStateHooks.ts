import {MapMode} from "../models/misc/mapMode";
import {GameSessionState} from "../models/misc/gameSessionState";
import {GameSessionDatabase} from "./database/gameSessionDatabase";
import {
	usePartialSingletonEntity,
	useQueryMultiple,
	useQuerySingle,
	useSingletonEntity,
} from "../common/db/adapters/databaseHooks";
import {TileDatabase} from "./database/tileDatabase";
import {CommandDatabase} from "./database/commandDatabase";
import {WorldObjectDatabase} from "./database/worldObjectDatabase";
import {MovementModeState} from "./database/movementModeState";
import {RealmDatabase} from "./database/realmDatabase";
import {Command} from "../models/command/command";
import {RealmOutline} from "../models/realm/realmOutline";
import {WorldObjectOutline} from "../models/worldobject/worldObjectOutline";
import {TileSummary} from "../models/tile/tileSummary";
import {Tile} from "../models/tile/tile";
import {WorldObjectId} from "../models/worldobject/worldObjectId";
import {TileId} from "../models/tile/tileId";
import {WorldObject} from "../models/worldobject/worldObject";
import {CameraEntity} from "../models/misc/cameraEntity";
import {CameraDatabase} from "./database/cameraDatabase";
import {RealmId} from "../models/realm/realmId";
import {Realm} from "../models/realm/realm";
import {Color} from "../common/color";
import {WorldObjectSummary} from "../models/worldobject/worldObjectSummary";
import {WorldObjectComponent} from "../models/worldobject/worldObjectComponent";
import {TilePosition} from "../models/tile/tilePosition";

export namespace GameStateHooks {

	function UNINITIALIZED<T>(): T {
		return null as T;
	}

	let gameSessionDatabase: GameSessionDatabase = UNINITIALIZED();
	let tileDatabase: TileDatabase = UNINITIALIZED();
	let commandDatabase: CommandDatabase = UNINITIALIZED();
	let worldObjectDatabase: WorldObjectDatabase = UNINITIALIZED();
	let realmDatabase: RealmDatabase = UNINITIALIZED();
	let cameraDatabase: CameraDatabase = UNINITIALIZED();

	export function initialize(dependencies: {
		gameSessionDatabase: GameSessionDatabase
		tileDatabase: TileDatabase
		commandDatabase: CommandDatabase
		worldObjectDatabase: WorldObjectDatabase
		realmDatabase: RealmDatabase
		cameraDatabase: CameraDatabase
	}) {
		gameSessionDatabase = dependencies.gameSessionDatabase;
		tileDatabase = dependencies.tileDatabase;
		commandDatabase = dependencies.commandDatabase;
		worldObjectDatabase = dependencies.worldObjectDatabase;
		realmDatabase = dependencies.realmDatabase;
		cameraDatabase = dependencies.cameraDatabase;
	}

	/**
	 * Get the current camera data
	 */
	export function useCamera(): CameraEntity {
		return useSingletonEntity(cameraDatabase);
	}

	/**
	 * Get the current turn counter
	 */
	export function useCurrentTurn(): number {
		return usePartialSingletonEntity(gameSessionDatabase, e => e.turn);
	}

	/**
	 * Get the current game session state (e.g. loading, playing, ...)
	 */
	export function useGameSessionState(): GameSessionState {
		return usePartialSingletonEntity(gameSessionDatabase, e => e.sessionState);
	}

	/**
	 * Whether the game is waiting for other players to end their turn
	 */
	export function useIsGameWaiting(): boolean {
		return usePartialSingletonEntity(gameSessionDatabase, e => e.turnState) === "waiting";
	}

	/**
	 * Get the current selected map mode
	 */
	export function useMapMode(): MapMode {
		return usePartialSingletonEntity(gameSessionDatabase, e => e.mapMode);
	}

	/**
	 * Get all commands given this turn
	 */
	export function useCommands(): Command[] {
		return useQueryMultiple(commandDatabase, CommandDatabase.QUERY_ALL, null);
	}

	/**
	 * Get the remaining movement points of the currently moving game object
	 */
	export function useRemainingMovementPoints(): number {
		const worldObjectId = MovementModeState.useState(state => state.worldObjectId);
		const path = MovementModeState.useState(state => state.path);
		const worldObject = useWorldObject(worldObjectId);
		if (worldObject) {
			const maxMovement = WorldObjectComponent.get<WorldObjectComponent.Move>(worldObject, "movement").maxMovement
			return maxMovement - path.sum(0, it => it.cost);
		} else {
			return 0;
		}
	}

	/**
	 * Get the outline information about all countries
	 */
	export function useOutlineRealms(): RealmOutline[] {
		return useQueryMultiple(realmDatabase, RealmDatabase.QUERY_ALL, null)
			.map(it => RealmOutline.from(it));
	}

	/**
	 * Get the outline information about all world objects
	 */
	export function useOutlineUnits(): WorldObjectOutline[] {
		return useQueryMultiple(worldObjectDatabase, WorldObjectDatabase.QUERY_ALL, null)
			.filter(it => it.type.group === "unit")
			.map(it => ({
				id: it.id,
				type: it.type,
				tile: it.tile,
				realm: it.realm,
			}));
	}

	/**
	 * Get the currently selected tile or null.
	 */
	export function useSelectedTile(): TileSummary | null {
		return usePartialSingletonEntity(gameSessionDatabase, e => e.selectedTile);
	}

	/**
	 * Get the tile with the given id
	 */
	export function useTile(tileId: TileId | null): Tile | null {
		const tileEntity = useQuerySingle(tileDatabase, TileDatabase.QUERY_BY_ID, tileId);
		const worldObjects = useWorldObjectAt(tileEntity ? tileEntity.position : TilePosition.NOWHERE)
		return tileEntity
			? Tile.from(tileEntity, worldObjects)
			: null;
	}

	/**
	 * Get the world objects at the given location
	 */
	export function useWorldObjectAt(pos: TilePosition): WorldObject[] {
		return useQueryMultiple(worldObjectDatabase, WorldObjectDatabase.QUERY_BY_POSITION, [pos.q, pos.r]);
	}

	/**
	 * Get the world object with the given id
	 */
	export function useWorldObject(id: WorldObjectId | null): WorldObject | null {
		return useQuerySingle(worldObjectDatabase, WorldObjectDatabase.QUERY_BY_ID, id);
	}

	/**
	 * Get the realm with the given id
	 */
	export function useRealm(id: RealmId | null): Realm | null {
		const realm = useQuerySingle(realmDatabase, RealmDatabase.QUERY_BY_ID, id);
		const worldObjects = useQueryMultiple(worldObjectDatabase, WorldObjectDatabase.QUERY_BY_REALM_ID, id);

		if (realm) {
			return {
				id: realm.id,
				name: realm.id,
				color: Color.BLACK,
				ownedByUser: realm.ownedByUser,
				player: realm.player,
				worldObjects: worldObjects.map(it => WorldObjectSummary.from(it)),
			};
		} else {
			return null;
		}

	}

}