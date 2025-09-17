export interface UserClient {
	/**
	 * Login with the given credentials
	 */
	login(email: string, password: string): Promise<{ idToken: string, refreshToken?: string }>;
	/**
	 * Sign Up as a new user with the given credentials
	 */
	signUp(email: string, password: string, username: string): Promise<void>;
	/**
	 * Delete the user with the given credentials
	 */
	deleteUser(email: string, password: string): Promise<void>;
}