package de.ruegnerlukas.strategygame.backend.ports.required

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.config.Config
import de.ruegnerlukas.strategygame.backend.config.ConfigData
import de.ruegnerlukas.strategygame.backend.external.users.AwsCognitoService
import de.ruegnerlukas.strategygame.backend.external.users.DummyUserIdentityService
import de.ruegnerlukas.strategygame.backend.ports.models.auth.AuthData
import de.ruegnerlukas.strategygame.backend.ports.models.auth.ExtendedAuthData
import io.ktor.server.auth.jwt.JWTAuthenticationProvider

interface UserIdentityService {

	sealed interface CreateUserError
	sealed interface DeleteUserError
	sealed interface AuthUserError
	sealed interface RefreshAuthError
	object UserAlreadyExistsError : CreateUserError
	object InvalidEmailOrPasswordError : CreateUserError
	object CodeDeliveryError : CreateUserError
	object NotAuthorizedError : AuthUserError, RefreshAuthError, DeleteUserError
	object UserNotConfirmedError : AuthUserError, RefreshAuthError
	object UserNotFoundError : AuthUserError, RefreshAuthError

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
	fun createUser(email: String, password: String, username: String): Either<CreateUserError, Unit>


	/**
	 * Authenticate the given user.
	 */
	fun authenticate(email: String, password: String): Either<AuthUserError, ExtendedAuthData>


	/**
	 * Refresh the authentication for a given user
	 */
	fun refreshAuthentication(refreshToken: String): Either<RefreshAuthError, AuthData>


	/**
	 * Delete the user with the given email and password
	 * @return whether the user has been deleted successfully
	 */
	suspend fun deleteUser(email: String, password: String): Either<DeleteUserError, Unit>

}