package io.github.smiley4.strategygame.backend.users.module.iam

import io.github.smiley4.strategygame.backend.common.UserIdentityProvider
import io.github.smiley4.strategygame.backend.common.UserIdentityServiceConfig
import io.github.smiley4.strategygame.backend.users.module.core.AuthData
import io.github.smiley4.strategygame.backend.users.module.core.AuthDataExtended
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
    class UserNotConfirmedError : UserIdentityError()

    /**
     * No user with the given data exists
     */
    class UserNotFoundError : UserIdentityError()


    companion object {

        /**
         * Create a new identity-service from the given config
         * @return the created [UserIdentityService]
         */
        fun createFromConfig(config: UserIdentityServiceConfig): UserIdentityService {
            return when (config.identityProvider) {
                UserIdentityProvider.AWS_COGNITO -> config.aws!!.let { awsCognitoConfig ->
                    AwsCognitoService.create(
                        poolId = awsCognitoConfig.poolId,
                        clientId = awsCognitoConfig.clientId,
                        accessKey = awsCognitoConfig.accessKeyId,
                        secretKey = awsCognitoConfig.secretAccessKey,
                        region = awsCognitoConfig.region
                    )
                }
                UserIdentityProvider.DUMMY -> DummyUserIdentityService()
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