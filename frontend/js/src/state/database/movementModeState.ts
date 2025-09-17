import create from "zustand";
import {MovementTarget} from "../../models/misc/movementTarget";
import {WorldObject} from "../../models/worldobject/worldObject";

export namespace MovementModeState {

	export interface State {
		path: MovementTarget[],
		availableTargets: MovementTarget[],
		worldObjectId: WorldObject.Id | null,
		set: (worldObjectId: WorldObject.Id | null, path: MovementTarget[], availableTargets: MovementTarget[]) => void
	}

	export const useState = create<State>((set) => ({
		path: [],
		availableTargets: [],
		worldObjectId: null,
		set: (worldObjectId: WorldObject.Id | null, path: MovementTarget[], availableTargets: MovementTarget[]) => set(() => ({
			worldObjectId: worldObjectId,
			path: path,
			availableTargets: availableTargets,
		})),
	}));

}