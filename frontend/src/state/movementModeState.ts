import create from "zustand";
import {TileIdentifier} from "../models/tile";
import {TilePosition} from "../models/tilePosition";

export namespace MovementModeState {

	export interface State {
		path: TileIdentifier[],
		availablePositions: TilePosition[],
		worldObjectId: string | null,
		set: (worldObjectId: string | null, path: TileIdentifier[], availablePositions: TilePosition[]) => void
	}

	export const useState = create<State>((set) => ({
		path: [],
		availablePositions: [],
		worldObjectId: null,
		set: (worldObjectId: string | null, path: TileIdentifier[], availablePositions: TilePosition[]) => set(() => ({
			worldObjectId: worldObjectId,
			path: path,
			availablePositions: availablePositions
		})),
	}));

}