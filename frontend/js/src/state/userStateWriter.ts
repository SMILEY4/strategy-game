import {UserState} from "./database/userState";

export interface UserStateWriter {
	setAuthToken(token: string | null): void;
}

export class UserStateWriterImpl implements UserStateWriter {

	setAuthToken(token: string | null): void {
		UserState.updateState(state => ({
			...state,
			token: token,
		}));
	}

}