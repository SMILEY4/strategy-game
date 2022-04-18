import create, {SetState} from "zustand";
import {mountStoreDevtool} from "simple-zustand-devtools";

export namespace GameState {

	interface StateValues {
		currentState: "idle" | "loading" | "active";
		worldId: string | null,
		map: Tile[];
	}

	interface Tile {
		q: number,
		r: number,
		tileId: number
	}

	const initialStateValues: StateValues = {
		worldId: null,
		currentState: "idle",
		map: []
	};


	interface StateActions {
		setIdle: () => void,
		setLoading: (worldId: string) => void,
		setActive: (map: Tile[]) => void
	}

	function stateActions(set: SetState<GameState.State>): StateActions {
		return {
			setIdle: () => set(() => ({
				currentState: "idle",
				worldId: null,
				map: []
			})),
			setLoading: (worldId: string) => set(() => ({
				currentState: "loading",
				worldId: worldId
			})),
			setActive: (map: Tile[]) => set(() => ({
				currentState: "active",
				map: map
			}))
		};
	}

	export interface State extends StateValues, StateActions {
	}

	export const useState = create<State>((set: SetState<GameState.State>) => ({
		...initialStateValues,
		...stateActions(set)
	}));

}


if (import.meta.env.MODE === "development") {
	// @ts-ignore
	mountStoreDevtool("GameState", GameState.useState);
}
