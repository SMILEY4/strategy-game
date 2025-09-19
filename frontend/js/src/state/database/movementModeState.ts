import create from "zustand";
import {WorldObject} from "../../models/worldobject/worldObject";
import {TileSummary} from "../../models/tile/tileSummary";

export namespace MovementModeState {

	export interface State {
		worldObjectId: WorldObject.Id | null,
		path: TileSummary[],
		set: (worldObjectId: WorldObject.Id | null, path: TileSummary[]) => void
	}

	export const useState = create<State>((set) => ({
		worldObjectId: null,
		path: [],
		set: (worldObjectId: WorldObject.Id | null, path: TileSummary[]) => set(() => ({
			worldObjectId: worldObjectId,
			path: path,
		})),
	}));

}