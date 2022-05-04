import {AuthProvider} from "../ports/provided/authProvider";
import {UserState} from "../../state/userState";

export class AuthProviderImpl implements AuthProvider {

	public isAuthenticated(): boolean {
		return UserState.useState.getState().idToken !== null;
	}

	public getToken(): string {
		const token = UserState.useState.getState().idToken;
		return token ? token : "";
	}

}