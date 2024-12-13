import {WorldObjectDatabase} from "../database/worldObjectDatabase";
import {TileIdentifier} from "../../models/base/tile";
import {WorldObject} from "../../models/base/worldObject";
import {MovementTarget} from "../../models/base/movementTarget";
import {MovementModeState} from "../database/movementModeState";
import {TilePosition} from "../../models/base/tilePosition";
import {CommandDatabase} from "../database/commandDatabase";
import {CommandType, MoveCommand} from "../../models/base/command";
import {useDI} from "../../appContext";
import {useQuerySingle} from "../../common/db/adapters/databaseHooks";

export class WorldObjectRepository {

	private readonly worldObjectDb: WorldObjectDatabase;
	private readonly commandDb: CommandDatabase;

	constructor(worldObjectDb: WorldObjectDatabase, commandDb: CommandDatabase) {
		this.worldObjectDb = worldObjectDb;
		this.commandDb = commandDb;
	}

	public get(worldObjectId: string): WorldObject | null {
		return this.worldObjectDb.querySingle(WorldObjectDatabase.QUERY_BY_ID, worldObjectId);
	}

	public getByTile(tileId: TileIdentifier): WorldObject | null {
		return this.worldObjectDb.querySingle(WorldObjectDatabase.QUERY_BY_POSITION, [tileId.q, tileId.r]);
	}

	public getAll(): WorldObject[] {
		return this.worldObjectDb.queryMany(WorldObjectDatabase.QUERY_ALL, null);
	}

	public getCurrentMovementModeState(): {
		worldObjectId: string | null,
		path: MovementTarget[],
		availableTargets: MovementTarget[]
	} {
		const state = MovementModeState.useState.getState();
		return {
			worldObjectId: state.worldObjectId,
			path: state.path,
			availableTargets: state.availableTargets,
		};
	}

	public setCurrentMovementModeState(worldObjectId: string | null, path: MovementTarget[], availableTargets: MovementTarget[]) {
		MovementModeState.useState.getState().set(worldObjectId, path, availableTargets);
	}

	public getMovementPaths(): { positions: TilePosition[], pending: boolean }[] {
		const paths: { positions: TilePosition[], pending: boolean }[] = [];
		const movementState = this.getCurrentMovementModeState();
		if (movementState.worldObjectId !== null) {
			paths.push({positions: movementState.path.map(it => it.tile), pending: true});
		}
		const moveCommands = this.commandDb.queryMany(CommandDatabase.QUERY_ALL, null).filter(it => it.type === CommandType.MOVE);
		moveCommands.forEach(cmd => {
			const path = (cmd as MoveCommand).path.map(tile => ({q: tile.q, r: tile.r}));
			paths.push({positions: path, pending: false});
		});
		return paths;
	}

	public getMovementTargets(): MovementTarget[] {
		return MovementModeState.useState.getState().availableTargets;
	}

}

export namespace WorldObjectRepository {


	export function useById(worldObjectId: string | null): WorldObject | null {
		const db = useDI<WorldObjectDatabase>(WorldObjectDatabase.name);
		return useQuerySingle(db, WorldObjectDatabase.QUERY_BY_ID, worldObjectId);
	}

	export function useCurrentMovementPath(): MovementTarget[] {
		return MovementModeState.useState(state => state.path);
	}

}