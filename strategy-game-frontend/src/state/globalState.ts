import create, {SetState} from "zustand";
import {mountStoreDevtool} from "simple-zustand-devtools";
import {Tile} from "./models/Tile";
import {PlaceMarkerCommand} from "./models/PlaceMarkerCommand";

export namespace GlobalState {

	export interface PlayerMarker {
		q: number,
		r: number,
		playerId: number
	}

	interface StateValues {
		currentState: "idle" | "loading" | "active",
		worldId: string | null,
		map: Tile[],
		playerCommands: PlaceMarkerCommand[],
		playerMarkers: PlayerMarker[],
		turnState: "active" | "submitted",
		camera: {
			x: number,
			y: number,
			zoom: number
		},
		tileMouseOver: null | [number, number]
	}


	const initialStateValues: StateValues = {
		currentState: "idle",
		worldId: null,
		map: [],
		playerCommands: [],
		playerMarkers: [],
		turnState: "active",
		camera: {
			x: 0,
			y: 0,
			zoom: 1
		},
		tileMouseOver: null
	};


	interface StateActions {
		setIdle: () => void,
		setLoading: (worldId: string) => void,
		setActive: (map: Tile[]) => void,
		addCommandPlaceMarker: (q: number, r: number) => void,
		clearCommands: () => void,
		addMarkers: (markers: PlayerMarker[]) => void,
		setTurnState: (state: "active" | "submitted") => void,
		moveCamera: (dx: number, dy: number) => void,
		zoomCamera: (dz: number) => void,
		setTileMouseOver: (tile: null | [number, number]) => void,
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
			})),

			moveCamera: (dx: number, dy: number) => set((state: GlobalState.State) => ({
				camera: {
					x: state.camera.x + (dx) / state.camera.zoom,
					y: state.camera.y - (dy) / state.camera.zoom,
					zoom: state.camera.zoom
				}
			})),
			zoomCamera: (dz: number) => set((state: GlobalState.State) => ({
				camera: {
					x: state.camera.x,
					y: state.camera.y,
					zoom: Math.max(0.01, state.camera.zoom - dz)
				}
			})),
			setTileMouseOver: (tile: null | [number, number]) => set(() => ({
				tileMouseOver: tile
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
