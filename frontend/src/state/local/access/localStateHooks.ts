import {Command} from "../../../models/base/command";
import {MapMode} from "../../../models/base/mapMode";
import {ProductionQueueEntry, SettlementIdentifier} from "../../../models/base/Settlement";
import {SettlementAggregate} from "../../../models/aggregates/SettlementAggregate";
import {Tile, TileIdentifier} from "../../../models/base/tile";
import {WorldObject, WorldObjectIdentifier} from "../../../models/base/worldObject";
import {GameSessionState} from "../../../models/base/gameSessionState";

export namespace LocalStateHooks {

	export function useCurrentTurn(): number {
		return 0; // todo
	}

	export function useGameSessionState(): GameSessionState {
		return false; // todo
	}

	export function useIsGameWaiting(): boolean {
		return false; // todo
	}

	export function useMapMode(): MapMode {
		return undefined as any // todo
	}

	export function useCommands(): Command[] {
		return [] // todo
	}

	export function useRemainingMovementPoints(): number {
		return 0;// todo
	}

	export function useOutlineCountries(): any[] {
		return []// todo
	}

	export function useOutlineSettlements(): any[] {
		return []// todo
	}

	export function useOutlineUnits(): any[] {
		return []// todo
	}

	export function useSettlement(settlementId: SettlementIdentifier): SettlementAggregate | null {
		return null as any; // todo
	}

	export function useProductionOptions(settlementId: SettlementIdentifier): any[] {
		return [] // todo
	}

	export function useProductionQueue(settlementId: SettlementIdentifier): any[] {
		return [] // todo
	}

	export function useProductionQueueActiveEntry(): ProductionQueueEntry | null {
		return null // todo
	}

	export function useSelectedTileId(): TileIdentifier | null {
		return null // todo
	}

	export function useTile(tileId: TileIdentifier | null): Tile | null {
		return null; // todo
	}

	export function useWorldObject(id: WorldObjectIdentifier | null): WorldObject | null {
		return null; // todo
	}

}