import create from "zustand";
import {WorldObject} from "../../models/worldobject/worldObject";
import {TileSummary} from "../../models/tile/tileSummary";

export namespace CreateSettlementModeState {

	export interface State {
		name: string | null;
		tile: TileSummary | null;
		worldObjectId: WorldObject.Id | null
		set: (state: State) => void
	}

	export const useState = create<State>((set) => ({
		name: null,
		tile: null,
		worldObjectId: null,
		set: (state: State) => set(() => ({
			...state
		})),
	}));

}