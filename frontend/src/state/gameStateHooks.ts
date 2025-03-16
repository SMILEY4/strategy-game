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
import {SettlementDatabase} from "./database/settlementDatabase";
import {WorldObjectDatabase} from "./database/worldObjectDatabase";
import {MovementModeState} from "./database/movementModeState";
import {CountryDatabase} from "./database/countryDatabase";
import {RouteDatabase} from "./database/routeDatabase";
import {Settlement, SettlementProductionOption, SettlementProductionQueueEntry} from "../models/settlement/settlement";
import {SettlementOutline} from "../models/settlement/settlementOutline";
import {Command} from "../models/command/command";
import {CountryOutline} from "../models/country/countryOutline";
import {WorldObjectOutline} from "../models/worldobject/worldObjectOutline";
import {TileSummary} from "../models/tile/tileSummary";
import {Tile} from "../models/tile/tile";
import {WorldObjectId} from "../models/worldobject/worldObjectId";
import {TileId} from "../models/tile/tileId";
import {WorldObject} from "../models/worldobject/worldObject";
import {SettlementBuilder} from "./utils/settlementBuilder";
import {CameraEntity} from "../models/misc/cameraEntity";
import {CameraDatabase} from "./database/cameraDatabase";
import {CountryId} from "../models/country/countryId";
import {Country} from "../models/country/country";

export namespace GameStateHooks {

	function UNINITIALIZED<T>(): T {
		return null as T;
	}

	let gameSessionDatabase: GameSessionDatabase = UNINITIALIZED();
	let tileDatabase: TileDatabase = UNINITIALIZED();
	let commandDatabase: CommandDatabase = UNINITIALIZED();
	let settlementDatabase: SettlementDatabase = UNINITIALIZED();
	let worldObjectDatabase: WorldObjectDatabase = UNINITIALIZED();
	let countryDatabase: CountryDatabase = UNINITIALIZED();
	let routeDatabase: RouteDatabase = UNINITIALIZED();
	let cameraDatabase: CameraDatabase = UNINITIALIZED();

	export function initialize(dependencies: {
		gameSessionDatabase: GameSessionDatabase
		tileDatabase: TileDatabase
		commandDatabase: CommandDatabase
		settlementDatabase: SettlementDatabase
		worldObjectDatabase: WorldObjectDatabase
		countryDatabase: CountryDatabase
		routeDatabase: RouteDatabase
		cameraDatabase: CameraDatabase
	}) {
		gameSessionDatabase = dependencies.gameSessionDatabase;
		tileDatabase = dependencies.tileDatabase;
		commandDatabase = dependencies.commandDatabase;
		settlementDatabase = dependencies.settlementDatabase;
		worldObjectDatabase = dependencies.worldObjectDatabase;
		countryDatabase = dependencies.countryDatabase;
		routeDatabase = dependencies.routeDatabase;
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
			return worldObject.maxMovementPoints - path.sum(0, it => it.cost);
		} else {
			return 0;
		}
	}

	/**
	 * Get the outline information about all countries
	 */
	export function useOutlineCountries(): CountryOutline[] {
		return useQueryMultiple(countryDatabase, CountryDatabase.QUERY_ALL, null)
			.map(it => ({
				id: it.id,
				name: it.name,
				color: it.color,
				isUserControlled: it.isUserControlled,
				playerName: it.player.name,
			}));
	}

	/**
	 * Get the outline information about all settlements
	 */
	export function useOutlineSettlements(): SettlementOutline[] {
		return useQueryMultiple(settlementDatabase, SettlementDatabase.QUERY_ALL, null)
			.map(it => ({
				id: it.id,
				name: it.name,
				color: it.color,
				tile: it.tile,
			}));
	}

	/**
	 * Get the outline information about all world objects
	 */
	export function useOutlineWorldObjects(): WorldObjectOutline[] {
		return useQueryMultiple(worldObjectDatabase, WorldObjectDatabase.QUERY_ALL, null)
			.map(it => ({
				id: it.id,
				type: it.type,
				tile: it.tile,
				country: it.country,
			}));
	}

	/**
	 * Get the settlement with the given id
	 */
	export function useSettlement(settlementId: string | null): Settlement | null {
		const settlement = useQuerySingle(settlementDatabase, SettlementDatabase.QUERY_BY_ID, settlementId);
		const settlements = useQueryMultiple(settlementDatabase, SettlementDatabase.QUERY_ALL, null);
		const routes = useQueryMultiple(routeDatabase, RouteDatabase.QUERY_BY_SETTLEMENT, settlementId);
		const commands = useQueryMultiple(commandDatabase, CommandDatabase.QUERY_ALL, null);
		if (settlement == null) {
			return null;
		}
		return SettlementBuilder.buildSettlement(settlement, routes, settlements, commands);
	}

	/**
	 * Get the current production options for the settlement with the given id
	 */
	export function useProductionOptions(settlementId: string): SettlementProductionOption[] {
		const settlement = useQuerySingle(settlementDatabase, SettlementDatabase.QUERY_BY_ID, settlementId);
		const commands = useQueryMultiple(commandDatabase, CommandDatabase.QUERY_ALL, null);
		if (settlement == null) {
			return [];
		}
		return SettlementBuilder.buildProductionOptions(settlement, commands);
	}

	/**
	 * Get the current production queue for the settlement with the given id
	 */
	export function useProductionQueue(settlementId: string): SettlementProductionQueueEntry[] {
		const settlement = useQuerySingle(settlementDatabase, SettlementDatabase.QUERY_BY_ID, settlementId);
		const commands = useQueryMultiple(commandDatabase, CommandDatabase.QUERY_ALL, null);
		if (settlement == null) {
			return [];
		}
		return SettlementBuilder.buildProductionQueue(settlement, commands);
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
		return useQuerySingle(tileDatabase, TileDatabase.QUERY_BY_ID, tileId);
	}

	/**
	 * Get the world object with the given id
	 */
	export function useWorldObject(id: WorldObjectId | null): WorldObject | null {
		return useQuerySingle(worldObjectDatabase, WorldObjectDatabase.QUERY_BY_ID, id);
	}

	/**
	 * Get the country with the given id
	 */
	export function useCountry(id: CountryId | null): Country | null {
		const country = useQuerySingle(countryDatabase, CountryDatabase.QUERY_BY_ID, id);
		const settlements = useQueryMultiple(settlementDatabase, SettlementDatabase.QUERY_BY_COUNTRY_ID, id);
		const worldObjects = useQueryMultiple(worldObjectDatabase, WorldObjectDatabase.QUERY_BY_COUNTRY_ID, id);

		if (country) {
			return {
				id: country.id,
				name: country.name,
				color: country.color,
				isUserControlled: country.isUserControlled,
				player: country.player,
				settlements: settlements.map(it => ({
					id: it.id,
					name: it.name,
					color: it.color,
					isUserControlled: it.country.isUserControlled,
				})),
				worldObjects: worldObjects.map(it => ({
					id: it.id,
					type: it.type,
					tile: it.tile,
				})),
			};
		} else {
			return null;
		}

	}

}