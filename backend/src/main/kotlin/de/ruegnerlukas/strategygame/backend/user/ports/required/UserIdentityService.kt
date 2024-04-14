package de.ruegnerlukas.strategygame.backend.user.ports.required

import de.ruegnerlukas.strategygame.backend.app.Config
import de.ruegnerlukas.strategygame.backend.app.ConfigData
import de.ruegnerlukas.strategygame.backend.user.external.client.AwsCognitoService
import de.ruegnerlukas.strategygame.backend.user.external.client.DummyUserIdentityService
import de.ruegnerlukas.strategygame.backend.user.ports.models.AuthData
import de.ruegnerlukas.strategygame.backend.user.ports.models.AuthDataExtended
import io.ktor.server.auth.jwt.JWTAuthenticationProvider

interface UserIdentityService {

    sealed class UserIdentityError : Exception()

    /**
     * The user already exists
     */
    class UserAlreadyExistsError : UserIdentityError()

    /**
     * The email or password is not valid
     */
    class InvalidEmailOrPasswordError : UserIdentityError()

    /**
     * the confirmation code could not be delivered (e.g. via email)
     */
    class CodeDeliveryError : UserIdentityError()

    /**
     * The given credentials are not valid, i.e. the user is not authorized
     */
    class NotAuthorizedError : UserIdentityError()

    /**
     * The user has not confirmed the account yet
     */
    class UserNotConfirmedError :UserIdentityError()

    /**
     * No user with the given data exists
     */
    class UserNotFoundError : UserIdentityError()


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
     * @throws UserAlreadyExistsError
     * @throws InvalidEmailOrPasswordError
     * @throws InvalidEmailOrPasswordError
     * @throws CodeDeliveryError
     */
    fun createUser(email: String, password: String, username: String)


    /**
     * Authenticate the given user.
     * @throws NotAuthorizedError
     * @throws UserNotConfirmedError
     * @throws UserNotFoundError
     */
    fun authenticate(email: String, password: String): AuthDataExtended


    /**
     * Refresh the authentication for a given user
     * @throws NotAuthorizedError
     * @throws UserNotConfirmedError
     * @throws UserNotFoundError
     */
    fun refreshAuthentication(refreshToken: String): AuthData


    /**
     * Delete the user with the given email and password
     * @throws NotAuthorizedError
     * @throws UserNotConfirmedError
     * @throws UserNotFoundError
     */
    suspend fun deleteUser(email: String, password: String)

}