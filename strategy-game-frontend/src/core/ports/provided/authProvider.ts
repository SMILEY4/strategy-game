export interface AuthProvider {

	/**
	 * Check whether the current user is authenticated
	 */
	isAuthenticated(): boolean,

	/**
	 * Return the authentication token
	 */
	getToken(): string
}