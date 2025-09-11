import {UserClient} from "../client/userClient";
import jwt_decode from "jwt-decode";
import {UserStateAccess} from "../../../state/userStateAccess";
import {UserStateWriter} from "../../../state/userStateWriter";


export interface UserService {
	/**
	 * Login as the given user
	 */
	login(email: string, password: string): Promise<void>;
	/**
	 * Sign up as a new user
	 */
	signup(email: string, password: string, username: string): Promise<void>;
	/**
	 * Whether the user is currently authenticated, i.e. a valid auth token is present
	 */
	isAuthenticated(): boolean;
}

export class UserServiceImpl implements UserService {

	private readonly client: UserClient;
	private readonly userStateAccess: UserStateAccess;
	private readonly userStateWriter: UserStateWriter;

	constructor(client: UserClient, userStateAccess: UserStateAccess, userStateWriter: UserStateWriter) {
		this.client = client;
		this.userStateAccess = userStateAccess;
		this.userStateWriter = userStateWriter;
	}

	login(email: string, password: string): Promise<void> {
		return this.client.login(email, password)
			.then(data => this.userStateWriter.setAuthToken(data.idToken));
	}

	signup(email: string, password: string, username: string): Promise<void> {
		return this.client.signUp(email, password, username);
	}

	isAuthenticated(): boolean {
		const token = this.userStateAccess.getAuthTokenOrNull();
		if (token) {
			return this.getTokenExpiration(token) > Date.now();
		} else {
			return false;
		}
	}

	private getUserId(): string {
		return this.userIdFromToken(this.userStateAccess.getAuthTokenOrNull());
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