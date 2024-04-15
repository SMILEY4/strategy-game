package de.ruegnerlukas.strategygame.backend.user.external.client

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
import de.ruegnerlukas.strategygame.backend.app.Config
import de.ruegnerlukas.strategygame.backend.common.utils.Err
import de.ruegnerlukas.strategygame.backend.common.logging.Logging
import de.ruegnerlukas.strategygame.backend.common.utils.Ok
import de.ruegnerlukas.strategygame.backend.common.utils.err
import de.ruegnerlukas.strategygame.backend.common.utils.ok
import de.ruegnerlukas.strategygame.backend.user.ports.models.AuthData
import de.ruegnerlukas.strategygame.backend.user.ports.models.AuthDataExtended
import de.ruegnerlukas.strategygame.backend.user.ports.required.UserIdentityService
import de.ruegnerlukas.strategygame.backend.user.ports.required.UserIdentityService.*
import io.ktor.server.auth.jwt.JWTAuthenticationProvider
import io.ktor.server.auth.jwt.JWTCredential
import io.ktor.server.auth.jwt.JWTPrincipal
import java.security.interfaces.RSAPrivateKey
import java.security.interfaces.RSAPublicKey
import java.util.concurrent.TimeUnit

class AwsCognitoService(
	private val provider: AWSCognitoIdentityProvider,
	private val clientId: String,
	private val poolId: String
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
			return AwsCognitoService(provider, clientId, poolId)
		}


		private fun jwkIssuer(): String {
			val region = Config.get().aws.region
			val poolId = Config.get().aws.cognito.poolId
			return "https://cognito-idp.$region.amazonaws.com/$poolId"
		}


		private fun jwkProvider(): JwkProvider {
			return JwkProviderBuilder(jwkIssuer())
				.cached(10, 24, TimeUnit.HOURS)
				.rateLimited(10, 1, TimeUnit.MINUTES)
				.build()
		}


		private fun validateJwt(credential: JWTCredential): JWTPrincipal? {
			val jwtAudience = Config.get().aws.cognito.clientId
			return if (credential.payload.audience.contains(jwtAudience)) {
				JWTPrincipal(credential.payload)
			} else {
				null
			}
		}

		private class AwsCognitoRSAKeyProvider : RSAKeyProvider {

			private val provider = jwkProvider()

			override fun getPublicKeyById(keyId: String?): RSAPublicKey {
				return provider.get(keyId).publicKey as RSAPublicKey
			}

			override fun getPrivateKey(): RSAPrivateKey? = null

			override fun getPrivateKeyId(): String? = null

		}

	}

	override fun configureAuthentication(config: JWTAuthenticationProvider.Config) {
		config.realm = "strategy-game"
		config.verifier(jwkProvider(), jwkIssuer()) {
			acceptLeeway(20)
		}
		config.validate { credential -> validateJwt(credential) }
	}


	override fun extractUserId(jwtToken: String): String {
		return JWT.decode(jwtToken).subject
	}


	override fun verifyJwtToken(token: String): Boolean {
		return try {
			val verifier: JWTVerifier = JWT
				.require(Algorithm.RSA256(AwsCognitoRSAKeyProvider()))
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
				is UsernameExistsException -> throw UserAlreadyExistsError()
				is InvalidParameterException -> throw InvalidEmailOrPasswordError()
				is InvalidPasswordException -> throw InvalidEmailOrPasswordError()
				is CodeDeliveryFailureException -> throw CodeDeliveryError()
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
				is NotAuthorizedException -> throw NotAuthorizedError()
				is UserNotConfirmedException -> throw UserNotConfirmedError()
				is UserNotFoundException -> throw UserNotFoundError()
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
				is NotAuthorizedException -> throw NotAuthorizedError()
				is UserNotConfirmedException -> throw UserNotConfirmedError()
				is UserNotFoundException -> throw UserNotFoundError()
				else -> throw Exception("Could not refresh auth-token.", e)
			}
		}
	}


	override suspend fun deleteUser(email: String, password: String) {
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