package de.ruegnerlukas.strategygame.backend.ports.required

import de.ruegnerlukas.strategygame.backend.external.users.AwsCognitoService
import de.ruegnerlukas.strategygame.backend.external.users.DummyUserIdentityService
import de.ruegnerlukas.strategygame.backend.ports.errors.ApplicationError
import de.ruegnerlukas.strategygame.backend.ports.models.auth.AuthData
import de.ruegnerlukas.strategygame.backend.ports.models.auth.ExtendedAuthData
import de.ruegnerlukas.strategygame.backend.shared.Config
import de.ruegnerlukas.strategygame.backend.shared.ConfigData
import de.ruegnerlukas.strategygame.backend.shared.Either
import io.ktor.server.auth.jwt.JWTAuthenticationProvider

interface UserIdentityService {

	companion object {

		fun create(config: ConfigData): UserIdentityService {
			return when (config.identityProvider) {
				"cognito" -> AwsCognitoService.create(
					poolId = Config.get().aws.cognito.poolId,
					clientId = Config.get().aws.cognito.clientId,
					accessKey = Config.get().aws.user.accessKey,
					secretKey = Config.get().aws.user.secretAccess,
					region = Config.get().aws.region
				)
				"dummy" -> DummyUserIdentityService()
				else -> throw IllegalStateException("Identity provider must either be 'cognito' 'dummy': ${config.identityProvider}")
			}
		}

	}


	/**
	 * Configure the ktor auth-plugin
	 */
	fun configureAuthentication(config: JWTAuthenticationProvider.Config)


	/**
	 * Extract the id of the user from the given token
	 */
	fun extractUserId(jwtToken: String): String


	/**
	 * Verify the validity of the given jwt (-> authenticates the user)
	 */
	fun verifyJwtToken(token: String): Boolean


	/**
	 * Create a new user identified by the given email and password
	 */
	fun createUser(email: String, password: String, username: String): Either<Unit, ApplicationError>


	/**
	 * Authenticate the given user.
	 */
	fun authenticate(email: String, password: String): Either<ExtendedAuthData, ApplicationError>


	/**
	 * Refresh the authentication for a given user
	 */
	fun refreshAuthentication(refreshToken: String): Either<AuthData, ApplicationError>


	/**
	 * Delete the user with the given email and password
	 * @return whether the user has been deleted successfully
	 */
	suspend fun deleteUser(email: String, password: String): Either<Unit, ApplicationError>

}