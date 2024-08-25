import create from "zustand";
import {MovementTarget} from "../../models/primitives/movementTarget";

export namespace MovementModeState {

	export interface State {
		path: MovementTarget[],
		availableTargets: MovementTarget[],
		worldObjectId: string | null,
		set: (worldObjectId: string | null, path: MovementTarget[], availableTargets: MovementTarget[]) => void
	}

	export const useState = create<State>((set) => ({
		path: [],
		availableTargets: [],
		worldObjectId: null,
		set: (worldObjectId: string | null, path: MovementTarget[], availableTargets: MovementTarget[]) => set(() => ({
			worldObjectId: worldObjectId,
			path: path,
			availableTargets: availableTargets,
		})),
	}));

}