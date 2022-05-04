import create, {SetState} from "zustand";
import {mountStoreDevtool} from "simple-zustand-devtools";
import {Tile} from "./models/Tile";
import {PlaceMarkerCommand} from "./models/PlaceMarkerCommand";

export namespace UserState {

	interface StateValues {
		idToken: string | null,
	}


	const initialStateValues: StateValues = {
		idToken: null,
	};


	interface StateActions {
		setAuth: (idToken: string) => void,
		clearAuth: () => void
	}


	function stateActions(set: SetState<UserState.State>): StateActions {
		return {
			setAuth: (idToken: string) => set(() => ({
				idToken: idToken,
			})),
			clearAuth: () => set(() => ({
				idToken: null,
			})),
		};
	}


	export interface State extends StateValues, StateActions {
	}


	export const useState = create<State>((set: SetState<UserState.State>) => ({
		...initialStateValues,
		...stateActions(set)
	}));

}


// if (import.meta.env.MODE === "development") {
// 	// @ts-ignore
// 	mountStoreDevtool("UserSTate", UserState.useState);
// }
