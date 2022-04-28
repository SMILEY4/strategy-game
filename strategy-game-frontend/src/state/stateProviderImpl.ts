import {StateProvider} from "../core/ports/required/stateProvider";
import {GlobalState} from "./globalState";

export class StateProviderImpl implements StateProvider {

	public getState(): GlobalState.State {
		return GlobalState.useState.getState();
	}

}