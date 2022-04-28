package de.ruegnerlukas.strategygame.backend.ports.required

import de.ruegnerlukas.strategygame.backend.ports.models.AuthResult

interface UserManagementClient {

	fun signUp(email: String, password: String, username: String)

	fun confirmSignUp(email: String, confirmationCode: String)

	fun authenticate(email: String, password: String): AuthResult

	fun refreshAuthentication(refreshToken: String): AuthResult

	fun delete()

}