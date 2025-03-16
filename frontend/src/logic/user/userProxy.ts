import {UserService} from "./service/userService";

/**
 * Service providing functionality for user interface and direct user interactions. Acts as a proxy to other services
 */
export interface UserProxy {
	login(email: string, password: string): Promise<void>,
	signup(email: string, password: string, username: string): Promise<void>,
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

}