import {UserState} from "./database/userState";

export interface UserStateAccess {
	getAuthTokenOrNull(): string | null
}

export class UserStateAccessImpl implements UserStateAccess {

	getAuthTokenOrNull(): string | null {
		return UserState.getState().token;
	}

}