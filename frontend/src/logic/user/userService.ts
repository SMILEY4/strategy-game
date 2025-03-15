import {UserClient} from "./userClient";
import jwt_decode from "jwt-decode";
import {LocalStateAccess} from "../../state/localStateAccess";
import {GameStateWriter} from "../../state/gameStateWriter";

/**
 * User specific service logic
 */
export class UserService {

	private readonly client: UserClient;
	private readonly localStateAccess: LocalStateAccess;
	private readonly gameStateWriter: GameStateWriter;

	constructor(client: UserClient, localStateAccess: LocalStateAccess, gameStateWriter: GameStateWriter) {
		this.client = client;
		this.localStateAccess = localStateAccess;
		this.gameStateWriter = gameStateWriter;
	}

	/**
	 * Login as the given user
	 */
	public login(email: string, password: string): Promise<void> {
		return this.client.login(email, password)
			.then(data => this.gameStateWriter.setAuthToken(data.idToken));
	}

	/**
	 * Sign up as a new user
	 */
	public signup(email: string, password: string, username: string): Promise<void> {
		return this.client.signUp(email, password, username);
	}

	/**
	 * @return whether a user is currently authenticated / logged-in
	 */
	public isAuthenticated(): boolean {
		const token = this.localStateAccess.getAuthTokenOrNull();
		if (token) {
			return this.getTokenExpiration(token) > Date.now();
		} else {
			return false;
		}
	}

	/**
	 * @return the id of the currently logged-in user, or an empty string
	 */
	public getUserId(): string {
		return this.userIdFromToken(this.localStateAccess.getAuthTokenOrNull());
	}

	private getTokenExpiration(token: string): number {
		return this.expirationFromToken(token);
	}

	private expirationFromToken(token: string): number {
		return (jwt_decode(token) as any).exp * 1000;
	}

	private userIdFromToken(token: string | null): string {
		if (token) {
			return (jwt_decode(token) as any).sub;
		} else {
			return "";
		}
	}

}