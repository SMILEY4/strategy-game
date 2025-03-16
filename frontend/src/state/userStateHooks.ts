import {UserState} from "./database/userState";

export namespace UserStateHooks {

	/**
	 * Whether an authentication token is present
	 */
	export function useIsAuthenticated(): boolean {
		return UserState.getState().token !== null;
	}

}