import create, {SetState} from "zustand";
import {mountStoreDevtool} from "simple-zustand-devtools";

export namespace GlobalState {

	export interface Tile {
		q: number,
		r: number,
		tileId: number
	}

	export interface PlaceMarkerCommand {
		q: number,
		r: number,
	}

	export interface PlayerMarker {
		q: number,
		r: number,
		playerId: number
	}

	interface StateValues {
		currentState: "idle" | "loading" | "active";
		worldId: string | null,
		map: Tile[];
		playerCommands: PlaceMarkerCommand[];
		playerMarkers: PlayerMarker[];
		turnState: "active" | "submitted";
	}


	const initialStateValues: StateValues = {
		currentState: "idle",
		worldId: null,
		map: [],
		playerCommands: [],
		playerMarkers: [
			{q: 0, r: 0, playerId: 0},
			{q: 1, r: 0, playerId: 1},
			{q: 0, r: 1, playerId: 2}
		],
		turnState: "active"
	};


	interface StateActions {
		setIdle: () => void,
		setLoading: (worldId: string) => void,
		setActive: (map: Tile[]) => void,
		addCommandPlaceMarker: (q: number, r: number) => void,
		clearCommands: () => void,
		addMarkers: (markers: PlayerMarker[]) => void,
		setTurnState: (state: "active" | "submitted") => void,
	}


	function stateActions(set: SetState<GlobalState.State>): StateActions {
		return {
			setIdle: () => set(() => ({
				...initialStateValues
			})),
			setLoading: (worldId: string) => set(() => ({
				currentState: "loading",
				worldId: worldId
			})),
			setActive: (map: Tile[]) => set(() => ({
				currentState: "active",
				map: map
			})),
			addMarkers: (markers: PlayerMarker[]) => set((state: GlobalState.State) => ({
				playerMarkers: [...state.playerMarkers, ...markers]
			})),
			addCommandPlaceMarker: (q: number, r: number) => set((state: GlobalState.State) => ({
				playerCommands: state.playerCommands.length === 0
					? [{q: q, r: r}]
					: [state.playerCommands[state.playerCommands.length - 1], {q: q, r: r}]
			})),
			clearCommands: () => set(() => ({
				playerCommands: []
			})),
			setTurnState: (state: "active" | "submitted") => set(() => ({
				turnState: state
			}))
		};
	}


	export interface State extends StateValues, StateActions {
	}


	export const useState = create<State>((set: SetState<GlobalState.State>) => ({
		...initialStateValues,
		...stateActions(set)
	}));

}


if (import.meta.env.MODE === "development") {
	// @ts-ignore
	mountStoreDevtool("GameState", GlobalState.useState);
}
