package io.github.smiley4.strategygame.backend.users.edge

import io.github.smiley4.strategygame.backend.common.UserIdentityProvider
import io.github.smiley4.strategygame.backend.common.UserIdentityServiceConfig
import io.github.smiley4.strategygame.backend.users.edge.models.AuthData
import io.github.smiley4.strategygame.backend.users.edge.models.AuthDataExtended
import io.github.smiley4.strategygame.backend.users.module.iam.AwsCognitoService
import io.github.smiley4.strategygame.backend.users.module.iam.DummyUserIdentityService
import io.ktor.server.auth.jwt.JWTAuthenticationProvider

interface UserIdentityService {

    sealed class UserIdentityError(message: String, cause: Throwable? = null) : Exception(message, cause)
    class UserAlreadyExistsError(cause: Throwable? = null) : UserIdentityError("The user already exists", cause)
    class InvalidEmailOrPasswordError(cause: Throwable? = null) : UserIdentityError("The email or password is not valid", cause)
    class CodeDeliveryError(cause: Throwable? = null) : UserIdentityError("The confirmation code could not be delivered", cause)
    class NotAuthorizedError(cause: Throwable? = null) : UserIdentityError("The given credentials are not valid, i.e. the user is not authorized", cause)
    class UserNotConfirmedError(cause: Throwable? = null) : UserIdentityError("The user has not confirmed the account yet", cause)
    class UserNotFoundError(cause: Throwable? = null) : UserIdentityError("No user with the given data exists", cause)


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
    fun deleteUser(email: String, password: String)

}