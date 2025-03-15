import {LocalStateAccess} from "../../state/localStateAccess";

/**
 * Service prodding authentication information of the current user
 */
export class AuthProvider {

	private readonly localStateAccess: LocalStateAccess;

	constructor(localStateAccess: LocalStateAccess) {
		this.localStateAccess = localStateAccess;
	}

	public getToken(): string | null {
		return this.localStateAccess.getAuthTokenOrNull();
	}

}