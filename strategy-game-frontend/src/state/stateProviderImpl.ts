import {StateProvider} from "../core/ports/required/stateProvider";
import {GlobalState} from "./globalState";
import {UserState} from "./userState";

export class StateProviderImpl implements StateProvider {

	public getState(): GlobalState.State {
		return GlobalState.useState.getState();
	}

	public getUserState(): UserState.State {
		return UserState.useState.getState();
	}

}