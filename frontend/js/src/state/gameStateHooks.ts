import {MapMode} from "../models/misc/mapMode";
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
import {WorldObject} from "../models/worldobject/worldObject";
import {CameraData} from "../models/misc/cameraData";
import {CameraDatabase} from "./database/cameraDatabase";
import {Realm} from "../models/realm/realm";
import {WorldObjectComponent} from "../models/worldobject/worldObjectComponent";
import {GameSession} from "../models/misc/gameSession";

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
	export function useCamera(): CameraData {
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
	export function useGameSessionState(): GameSession.SessionState {
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
			const maxMovement = WorldObjectComponent.get(worldObject, WorldObjectComponent.Type.Movement).maxMovement
			return maxMovement - (path.length - 1)
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
	 * Get the outline information about all units
	 */
	export function useOutlineUnits(): WorldObjectOutline[] {
		return useQueryMultiple(worldObjectDatabase, WorldObjectDatabase.QUERY_ALL, null) // todo: dedicated query
			.filter(it => it.type.group === WorldObject.TypeGroup.Unit)
			.map(it => ({
				id: it.id,
				type: it.type,
				tile: it.tile,
				realm: it.realm,
			}));
	}

	/**
	 * Get the outline information about all tile improvements
	 */
	export function useOutlineTileImprovements(): WorldObjectOutline[] {
		return useQueryMultiple(worldObjectDatabase, WorldObjectDatabase.QUERY_ALL, null) // todo: dedicated query
			.filter(it => it.type.group === WorldObject.TypeGroup.TileImprovement)
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
	export function useTile(tileId: Tile.Id | null): Tile | null {
		return useQuerySingle(tileDatabase, TileDatabase.QUERY_BY_ID, tileId);
	}

	/**
	 * Get the world object with the given id
	 */
	export function useWorldObject(id: WorldObject.Id | null): WorldObject | null {
		return useQuerySingle(worldObjectDatabase, WorldObjectDatabase.QUERY_BY_ID, id);
	}


	/**
	 * Get the world objects at the given location
	 */
	export function useWorldObjectAt(pos: Tile.Position | null): WorldObject[] {
		return useQueryMultiple(worldObjectDatabase, WorldObjectDatabase.QUERY_BY_POSITION, pos ? [pos.q, pos.r] :  Tile.POSITION_NOWHERE);
	}

	/**
	 * Get the world object belonging to the given realm
	 */
	export function useWorldObjectsOfRealm(id: Realm.Id | null): WorldObject[] {
		return useQueryMultiple(worldObjectDatabase, WorldObjectDatabase.QUERY_BY_REALM_ID, id);
	}

	/**
	 * Get the realm with the given id
	 */
	export function useRealm(id: Realm.Id | null): Realm | null {
		return useQuerySingle(realmDatabase, RealmDatabase.QUERY_BY_ID, id);
	}

}