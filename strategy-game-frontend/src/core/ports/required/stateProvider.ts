import {GlobalState} from "../../../state/globalState";

export interface StateProvider {
	getState: () => GlobalState.State
}