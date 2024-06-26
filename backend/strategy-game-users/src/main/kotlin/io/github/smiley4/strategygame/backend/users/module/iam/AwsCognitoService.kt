package io.github.smiley4.strategygame.backend.users.module.iam

import com.amazonaws.auth.AWSStaticCredentialsProvider
import com.amazonaws.auth.BasicAWSCredentials
import com.amazonaws.services.cognitoidp.AWSCognitoIdentityProvider
import com.amazonaws.services.cognitoidp.AWSCognitoIdentityProviderClientBuilder
import com.amazonaws.services.cognitoidp.model.AdminInitiateAuthRequest
import com.amazonaws.services.cognitoidp.model.AttributeType
import com.amazonaws.services.cognitoidp.model.AuthFlowType
import com.amazonaws.services.cognitoidp.model.CodeDeliveryFailureException
import com.amazonaws.services.cognitoidp.model.DeleteUserRequest
import com.amazonaws.services.cognitoidp.model.InvalidParameterException
import com.amazonaws.services.cognitoidp.model.InvalidPasswordException
import com.amazonaws.services.cognitoidp.model.NotAuthorizedException
import com.amazonaws.services.cognitoidp.model.SignUpRequest
import com.amazonaws.services.cognitoidp.model.UserNotConfirmedException
import com.amazonaws.services.cognitoidp.model.UserNotFoundException
import com.amazonaws.services.cognitoidp.model.UsernameExistsException
import com.auth0.jwk.JwkProvider
import com.auth0.jwk.JwkProviderBuilder
import com.auth0.jwt.JWT
import com.auth0.jwt.JWTVerifier
import com.auth0.jwt.algorithms.Algorithm
import com.auth0.jwt.exceptions.JWTVerificationException
import com.auth0.jwt.interfaces.RSAKeyProvider
import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.users.edge.models.AuthData
import io.github.smiley4.strategygame.backend.users.edge.models.AuthDataExtended
import io.ktor.server.auth.jwt.JWTAuthenticationProvider
import io.ktor.server.auth.jwt.JWTCredential
import io.ktor.server.auth.jwt.JWTPrincipal
import java.security.interfaces.RSAPrivateKey
import java.security.interfaces.RSAPublicKey
import java.util.concurrent.TimeUnit

internal class AwsCognitoService(
    private val provider: AWSCognitoIdentityProvider,
    private val clientId: String,
    private val poolId: String,
    private val region: String,
) : UserIdentityService, Logging {

    companion object {

        /**
         * @param poolId the id of the user pool
         * @param clientId the id of the client associated with the user pool
         * @param accessKey the AWS-User access key
         * @param secretKey the AWS-User secret access key
         * @param region the region to use
         */
        fun create(poolId: String, clientId: String, accessKey: String, secretKey: String, region: String): AwsCognitoService {
            val provider = AWSCognitoIdentityProviderClientBuilder
                .standard()
                .withRegion(region)
                .withCredentials(AWSStaticCredentialsProvider(BasicAWSCredentials(accessKey, secretKey)))
                .build()
            return AwsCognitoService(provider, clientId, poolId, region)
        }


        private fun jwkIssuer(region: String, poolId: String): String {
            return "https://cognito-idp.$region.amazonaws.com/$poolId"
        }


        private fun jwkProvider(region: String, poolId: String): JwkProvider {
            return JwkProviderBuilder(jwkIssuer(region, poolId))
                .cached(10, 24, TimeUnit.HOURS)
                .rateLimited(10, 1, TimeUnit.MINUTES)
                .build()
        }


        private fun validateJwt(clientId: String, credential: JWTCredential): JWTPrincipal? {
            return if (credential.payload.audience.contains(clientId)) {
                JWTPrincipal(credential.payload)
            } else {
                null
            }
        }

        private class AwsCognitoRSAKeyProvider(region: String, poolId: String) : RSAKeyProvider {

            private val provider = jwkProvider(region, poolId)

            override fun getPublicKeyById(keyId: String?): RSAPublicKey {
                return provider.get(keyId).publicKey as RSAPublicKey
            }

            override fun getPrivateKey(): RSAPrivateKey? = null

            override fun getPrivateKeyId(): String? = null

        }

    }

    override fun configureAuthentication(config: JWTAuthenticationProvider.Config) {
        config.realm = "strategy-game"
        config.verifier(jwkProvider(region, poolId), jwkIssuer(region, poolId)) {
            acceptLeeway(20)
        }
        config.validate { credential -> validateJwt(clientId, credential) }
    }


    override fun extractUserId(jwtToken: String): String {
        return JWT.decode(jwtToken).subject
    }


    override fun verifyJwtToken(token: String): Boolean {
        return try {
            val verifier: JWTVerifier = JWT
                .require(Algorithm.RSA256(AwsCognitoRSAKeyProvider(region, poolId)))
                .acceptLeeway(30)
                .build()
            verifier.verify(token)
            true
        } catch (exception: JWTVerificationException) {
            false
        }
    }


    override fun createUser(email: String, password: String, username: String) {
        try {
            provider.signUp(
                SignUpRequest()
                    .withClientId(clientId)
                    .withUsername(email)
                    .withPassword(password)
                    .withUserAttributes(
                        AttributeType()
                            .withName("nickname")
                            .withValue(username)
                    )
            )
            log().info("Successfully created user $email")
        } catch (e: Exception) {
            log().info("Failed to create user $email: ${e.message}", e)
            when (e) {
                is UsernameExistsException -> throw UserIdentityService.UserAlreadyExistsError(e)
                is InvalidParameterException -> throw UserIdentityService.InvalidEmailOrPasswordError(e)
                is InvalidPasswordException -> throw UserIdentityService.InvalidEmailOrPasswordError(e)
                is CodeDeliveryFailureException -> throw UserIdentityService.CodeDeliveryError(e)
                else -> throw Exception("Could not create user.", e)
            }
        }
    }


    override fun authenticate(email: String, password: String): AuthDataExtended {
        try {
            val result = provider.adminInitiateAuth(
                AdminInitiateAuthRequest()
                    .withAuthFlow(AuthFlowType.ADMIN_NO_SRP_AUTH)
                    .withUserPoolId(poolId)
                    .withClientId(clientId)
                    .withAuthParameters(
                        mapOf(
                            "USERNAME" to email,
                            "PASSWORD" to password
                        )
                    )
            )
            log().info("Successfully authenticated user $email")
            return AuthDataExtended(
                idToken = result.authenticationResult.idToken,
                refreshToken = result.authenticationResult.refreshToken,
                accessToken = result.authenticationResult.accessToken
            )
        } catch (e: Exception) {
            log().info("Failed to authenticate user $email: ${e.message}", e)
            when (e) {
                is NotAuthorizedException -> throw UserIdentityService.NotAuthorizedError(e)
                is UserNotConfirmedException -> throw UserIdentityService.UserNotConfirmedError(e)
                is UserNotFoundException -> throw UserIdentityService.UserNotFoundError(e)
                else -> throw Exception("Could not authenticate user.", e)
            }
        }
    }


    override fun refreshAuthentication(refreshToken: String): AuthData {
        try {
            val result = provider.adminInitiateAuth(
                AdminInitiateAuthRequest()
                    .withUserPoolId(poolId)
                    .withAuthFlow(AuthFlowType.REFRESH_TOKEN_AUTH)
                    .withClientId(clientId)
                    .withAuthParameters(mapOf("REFRESH_TOKEN" to refreshToken))
            )
            log().info("Successfully refreshed user-authentication")
            return AuthData(
                idToken = result.authenticationResult.idToken,
                refreshToken = result.authenticationResult.refreshToken,
            )
        } catch (e: Exception) {
            log().info("Failed to refresh user-authentication: ${e.message}", e)
            when (e) {
                is NotAuthorizedException -> throw UserIdentityService.NotAuthorizedError(e)
                is UserNotConfirmedException -> throw UserIdentityService.UserNotConfirmedError(e)
                is UserNotFoundException -> throw UserIdentityService.UserNotFoundError(e)
                else -> throw Exception("Could not refresh auth-token.", e)
            }
        }
    }


    override fun deleteUser(email: String, password: String) {
        try {
            val auth = authenticate(email, password)
            provider.deleteUser(DeleteUserRequest().withAccessToken(auth.accessToken))
            log().info("Successfully deleted user $email")
        } catch (e: Exception) {
            log().info("Failed to delete user $email: ${e.message}", e)
            throw Exception("Could not delete user.", e)
        }
    }

}