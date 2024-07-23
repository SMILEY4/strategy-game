import create from "zustand";
import {TileIdentifier} from "../models/tile";

export namespace MovementModeState {

	export interface State {
		path: TileIdentifier[],
		worldObjectId: string | null,
		set: (worldObjectId: string | null, path: TileIdentifier[]) => void
	}

	export const useState = create<State>((set) => ({
		path: [],
		worldObjectId: null,
		set: (worldObjectId: string | null, path: TileIdentifier[]) => set(() => ({
			worldObjectId: worldObjectId,
			path: path,
		})),
	}));

}