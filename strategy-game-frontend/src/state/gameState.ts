import create from "zustand";

export namespace GameState {

	export interface State {
		initialized: boolean;
		map: Tile[];
	}

	export interface Tile {
		q: number,
		r: number,
		tileId: number
	}


	const initialState: State = {
		initialized: false,
		map: []
	};


	export const useState = create<State>(() => initialState);

}

