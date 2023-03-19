package de.ruegnerlukas.strategygame.backend.ports.required

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.app.Config
import de.ruegnerlukas.strategygame.backend.app.ConfigData
import de.ruegnerlukas.strategygame.backend.external.users.AwsCognitoService
import de.ruegnerlukas.strategygame.backend.external.users.DummyUserIdentityService
import de.ruegnerlukas.strategygame.backend.ports.models.AuthData
import de.ruegnerlukas.strategygame.backend.ports.models.AuthDataExtended
import io.ktor.server.auth.jwt.JWTAuthenticationProvider

interface UserIdentityService {

    /**
     * Error when creating a new user
     */
    sealed interface CreateUserError

    /**
     * Error when deleting a user
     */
    sealed interface DeleteUserError

    /**
     * Error when authenticating a user
     */
    sealed interface AuthUserError

    /**
     * Error when refreshing a token
     */
    sealed interface RefreshAuthError

    /**
     * The user already exists
     */
    object UserAlreadyExistsError : CreateUserError {
        override fun toString(): String = this.javaClass.simpleName
    }

    /**
     * The email or password is not valid
     */
    object InvalidEmailOrPasswordError : CreateUserError {
        override fun toString(): String = this.javaClass.simpleName
    }

    /**
     * the confirmation code could not be delivered (e.g. via email)
     */
    object CodeDeliveryError : CreateUserError {
        override fun toString(): String = this.javaClass.simpleName
    }

    /**
     * The given credentials are not valid, i.e. the user is not authorized
     */
    object NotAuthorizedError : AuthUserError, RefreshAuthError, DeleteUserError {
        override fun toString(): String = this.javaClass.simpleName
    }

    /**
     * The user has not confirmed the account yet
     */
    object UserNotConfirmedError : AuthUserError, RefreshAuthError {
        override fun toString(): String = this.javaClass.simpleName
    }

    /**
     * No user with the given data exists
     */
    object UserNotFoundError : AuthUserError, RefreshAuthError {
        override fun toString(): String = this.javaClass.simpleName
    }


    companion object {

        /**
         * Create a new identity-service from the given config
         * @return the created [UserIdentityService]
         */
        fun create(config: ConfigData): UserIdentityService {
            return when (config.identityProvider) {
                "cognito" -> AwsCognitoService.create(
                    poolId = Config.get().aws.cognito.poolId,
                    clientId = Config.get().aws.cognito.clientId,
                    accessKey = Config.get().aws.user.accessKeyId,
                    secretKey = Config.get().aws.user.secretAccessKey,
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
    fun authenticate(email: String, password: String): Either<AuthUserError, AuthDataExtended>


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