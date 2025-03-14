import {Command} from "../../../models/base/command";
import {MapMode} from "../../../models/base/mapMode";
import {Tile, TileIdentifier} from "../../../models/base/tile";
import {WorldObject, WorldObjectIdentifier, WorldObjectOutline} from "../../../models/base/worldObject";
import {GameSessionState} from "../../../models/base/gameSessionState";
import {GameSessionDatabase} from "../../database/gameSessionDatabase";
import {usePartialSingletonEntity, useQueryMultiple, useQuerySingle} from "../../../common/db/adapters/databaseHooks";
import {TileDatabase} from "../../database/tileDatabase";
import {CommandDatabase} from "../../database/commandDatabase";
import {SettlementDatabase} from "../../database/settlementDatabase";
import {WorldObjectDatabase} from "../../database/worldObjectDatabase";
import {MovementModeState} from "../../database/movementModeState";
import {CountryOutline} from "../../../models/base/country";
import {CountryDatabase} from "../../database/countryDatabase";
import {LocalSettlementBuilder} from "../localSettlementBuilder";
import {RouteDatabase} from "../../database/routeDatabase";
import {
	Settlement,
	SettlementProductionOption,
	SettlementProductionQueueEntry,
} from "../../../models/settlement/settlement";
import {SettlementOutline} from "../../../models/settlement/settlementOutline";

export namespace LocalStateHooks {

	// todo
	const gameSessionDatabase: GameSessionDatabase = null;
	const tileDatabase: TileDatabase = null;
	const commandDatabase: CommandDatabase = null;
	const settlementDatabase: SettlementDatabase = null;
	const worldObjectDatabase: WorldObjectDatabase = null;
	const countryDatabase: CountryDatabase = null;
	const routeDatabase: RouteDatabase = null;

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
		const path = MovementModeState.useState(state => state.path);
		return 0;// todo (calculate remaining movement points)
	}

	export function useOutlineCountries(): CountryOutline[] {
		return useQueryMultiple(countryDatabase, CountryDatabase.QUERY_ALL, null)
			.map(it => ({
				identifier: it.identifier,
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

	export function useOutlineUnits(): WorldObjectOutline[] {
		return useQueryMultiple(worldObjectDatabase, WorldObjectDatabase.QUERY_ALL, null)
			.map(it => ({
				identifier: it.identifier,
				tile: it.tile,
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
		return LocalSettlementBuilder.buildSettlement(settlement, routes, settlements, commands);
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
		return LocalSettlementBuilder.buildProductionOptions(settlement, commands);
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
		return LocalSettlementBuilder.buildProductionQueue(settlement, commands);
	}

	export function useSelectedTileId(): TileIdentifier | null {
		return usePartialSingletonEntity(gameSessionDatabase, e => e.selectedTile);
	}

	export function useTile(tileId: TileIdentifier | null): Tile | null {
		return useQuerySingle(tileDatabase, TileDatabase.QUERY_BY_ID, tileId?.id);
	}

	export function useWorldObject(id: WorldObjectIdentifier | null): WorldObject | null {
		return useQuerySingle(worldObjectDatabase, WorldObjectDatabase.QUERY_BY_ID, id?.id);
	}

}