package de.ruegnerlukas.strategygame.backend.external.awscognito

import com.amazonaws.auth.AWSStaticCredentialsProvider
import com.amazonaws.auth.BasicAWSCredentials
import com.amazonaws.services.cognitoidp.AWSCognitoIdentityProvider
import com.amazonaws.services.cognitoidp.AWSCognitoIdentityProviderClientBuilder
import com.amazonaws.services.cognitoidp.model.AdminInitiateAuthRequest
import com.amazonaws.services.cognitoidp.model.AttributeType
import com.amazonaws.services.cognitoidp.model.AuthFlowType
import com.amazonaws.services.cognitoidp.model.CodeDeliveryFailureException
import com.amazonaws.services.cognitoidp.model.CodeMismatchException
import com.amazonaws.services.cognitoidp.model.ConfirmSignUpRequest
import com.amazonaws.services.cognitoidp.model.DeleteUserRequest
import com.amazonaws.services.cognitoidp.model.ExpiredCodeException
import com.amazonaws.services.cognitoidp.model.InvalidParameterException
import com.amazonaws.services.cognitoidp.model.InvalidPasswordException
import com.amazonaws.services.cognitoidp.model.NotAuthorizedException
import com.amazonaws.services.cognitoidp.model.SignUpRequest
import com.amazonaws.services.cognitoidp.model.TooManyFailedAttemptsException
import com.amazonaws.services.cognitoidp.model.UserNotConfirmedException
import com.amazonaws.services.cognitoidp.model.UserNotFoundException
import com.amazonaws.services.cognitoidp.model.UsernameExistsException
import de.ruegnerlukas.strategygame.backend.ports.models.AuthResult
import de.ruegnerlukas.strategygame.backend.ports.models.ExtendedAuthResult
import de.ruegnerlukas.strategygame.backend.ports.required.UserManagementClient
import de.ruegnerlukas.strategygame.backend.shared.Logging
import de.ruegnerlukas.strategygame.backend.shared.results.Result
import de.ruegnerlukas.strategygame.backend.shared.results.VoidResult


class AwsCognito(private val provider: AWSCognitoIdentityProvider, private val clientId: String, private val poolId: String) :
	UserManagementClient, Logging {

	companion object {
		/**
		 * @param poolId the id of the user pool
		 * @param clientId the id of the client associated with the user pool
		 * @param accessKey the AWS-User access key
		 * @param secretKey the AWS-User secret access key
		 * @param region the region to use
		 */
		fun create(poolId: String, clientId: String, accessKey: String, secretKey: String, region: String): AwsCognito {
			val provider = AWSCognitoIdentityProviderClientBuilder
				.standard()
				.withRegion(region)
				.withCredentials(AWSStaticCredentialsProvider(BasicAWSCredentials(accessKey, secretKey)))
				.build()
			return AwsCognito(provider, clientId, poolId)
		}
	}

	override fun createUser(email: String, password: String, username: String): VoidResult {
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
			return VoidResult.success()
		} catch (e: Exception) {
			log().info("Failed to create user $email: ${e.message}")
			log().debug("Failed to create user $email", e)
			return when (e) {
				is UsernameExistsException -> VoidResult.error("USER_EXISTS")
				is InvalidParameterException -> VoidResult.error("INVALID_EMAIL_OR_PASSWORD")
				is CodeDeliveryFailureException -> VoidResult.error("CODE_DELIVERY_FAILURE")
				else -> VoidResult.error("INTERNAL_ERROR")
			}
		}
	}

	override fun confirmUser(email: String, confirmationCode: String): VoidResult {
		try {
			provider.confirmSignUp(
				ConfirmSignUpRequest()
					.withClientId(clientId)
					.withUsername(email)
					.withConfirmationCode(confirmationCode)
			)
			log().info("Successfully confirmed user $email")
			return VoidResult.success()
		} catch (e: Exception) {
			log().info("Failed to confirm user $email: ${e.message}")
			log().debug("Failed to confirm user $email", e)
			return when (e) {
				is TooManyFailedAttemptsException -> VoidResult.error("TOO_MANY_FAILED_ATTEMPTS")
				is CodeMismatchException -> VoidResult.error("CODE_MISMATCH")
				is UserNotFoundException -> VoidResult.error("USER_NOT_FOUND")
				is ExpiredCodeException -> VoidResult.error("EXPIRED_CODE")
				else -> VoidResult.error("INTERNAL_ERROR")
			}
		}
	}

	override fun authenticate(email: String, password: String): Result<ExtendedAuthResult> {
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
			return Result.success(
				ExtendedAuthResult(
					idToken = result.authenticationResult.idToken,
					refreshToken = result.authenticationResult.refreshToken,
					accessToken = result.authenticationResult.accessToken
				)
			)
		} catch (e: Exception) {
			log().info("Failed to authenticate user $email: ${e.message}")
			log().debug("Failed to authenticate user $email", e)
			return when (e) {
				is NotAuthorizedException -> Result.error("NOT_AUTHORIZED")
				is UserNotConfirmedException -> Result.error("USER_NOT_CONFIRMED")
				is UserNotFoundException -> Result.error("USER_NOT_FOUND")
				else -> Result.error("INTERNAL_ERROR")
			}
		}
	}

	override fun refreshAuthentication(refreshToken: String): Result<AuthResult> {
		try {
			val result = provider.adminInitiateAuth(
				AdminInitiateAuthRequest()
					.withUserPoolId(poolId)
					.withAuthFlow(AuthFlowType.REFRESH_TOKEN_AUTH)
					.withClientId(clientId)
					.withAuthParameters(mapOf("REFRESH_TOKEN" to refreshToken))
			)
			log().info("Successfully refreshed user-authentication")
			return Result.success(
				AuthResult(
					idToken = result.authenticationResult.idToken,
					refreshToken = result.authenticationResult.refreshToken,
				)
			)
		} catch (e: Exception) {
			e.printStackTrace()
			log().info("Failed to refresh user-authentication: ${e.message}")
			log().debug("Failed to refresh user-authentication", e)
			return when (e) {
				is NotAuthorizedException -> Result.error("NOT_AUTHORIZED")
				is UserNotConfirmedException -> Result.error("USER_NOT_CONFIRMED")
				is UserNotFoundException -> Result.error("USER_NOT_FOUND")
				else -> Result.error("INTERNAL_ERROR")
			}
		}
	}

	override fun deleteUser(email: String, password: String): VoidResult {
		try {
			authenticate(email, password)
				.onSuccess { provider.deleteUser(DeleteUserRequest().withAccessToken(it.accessToken)) }
				.onError { throw IllegalStateException(it) }
			log().info("Successfully deleted user $email")
			return VoidResult.success()
		} catch (e: Exception) {
			log().info("Failed to delete user $email: ${e.message}")
			log().debug("Failed to delete user $email", e)
			return when (e) {
				is IllegalStateException -> VoidResult.error("NOT_AUTHORIZED")
				else -> VoidResult.error("INTERNAL_ERROR")
			}
		}
	}

}