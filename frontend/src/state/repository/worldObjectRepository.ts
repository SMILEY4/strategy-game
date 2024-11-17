import {WorldObjectDatabase} from "../database/objectDatabase";
import {TileIdentifier} from "../../models/base/tile";
import {WorldObject} from "../../models/base/worldObject";
import {MovementTarget} from "../../models/base/movementTarget";
import {MovementModeState} from "../database/movementModeState";

export class WorldObjectRepository {

	private readonly worldObjectDb: WorldObjectDatabase;

	constructor(worldObjectDb: WorldObjectDatabase) {
		this.worldObjectDb = worldObjectDb;
	}

	public get(worldObjectId: string): WorldObject | null {
		return this.worldObjectDb.querySingle(WorldObjectDatabase.QUERY_BY_ID, worldObjectId);
	}

	public getByTile(tileId: TileIdentifier): WorldObject | null {
		return this.worldObjectDb.querySingle(WorldObjectDatabase.QUERY_BY_POSITION, [tileId.q, tileId.r]);
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

}