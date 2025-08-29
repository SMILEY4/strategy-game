import {UserService} from "./service/userService";

/**
 * Service providing functionality for user interface and direct user interactions. Acts as a proxy to other services
 */
export interface UserProxy {
	/**
	 * Login as the given user
	 */
	login(email: string, password: string): Promise<void>,
	/**
	 * Sign up as a new user
	 */
	signup(email: string, password: string, username: string): Promise<void>,
	/**
	 * Whether the user is currently authenticated, i.e. a valid auth token is present
	 */
	isAuthenticated(): boolean
}

export class UserProxyImpl implements UserProxy {

	private readonly userService: UserService;

	constructor(userService: UserService) {
		this.userService = userService;
	}

	login(email: string, password: string): Promise<void> {
		return this.userService.login(email, password);
	}

	signup(email: string, password: string, username: string): Promise<void> {
		return this.userService.signup(email, password, username);
	}

	isAuthenticated(): boolean {
		return this.userService.isAuthenticated()
	}

}