package de.ruegnerlukas.strategygame.backend.ports.required

import de.ruegnerlukas.strategygame.backend.ports.models.AuthResult
import de.ruegnerlukas.strategygame.backend.ports.models.ExtendedAuthResult
import de.ruegnerlukas.strategygame.backend.shared.results.Result
import de.ruegnerlukas.strategygame.backend.shared.results.VoidResult

interface UserManagementClient {

	/**
	 * Create a new user identified by the given email and password
	 */
	fun createUser(email: String, password: String, username: String): VoidResult


	/**
	 * Authenticate the given user.
	 */
	fun authenticate(email: String, password: String): Result<ExtendedAuthResult>


	/**
	 * Refresh the authentication for a given user
	 */
	fun refreshAuthentication(refreshToken: String): Result<AuthResult>


	/**
	 * Delete the user with the given email and password
	 * @return whether the user has been deleted successfully
	 */
	fun deleteUser(email: String, password: String): VoidResult

}