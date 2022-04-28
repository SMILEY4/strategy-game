package de.ruegnerlukas.strategygame.backend.external.awscognito

import com.amazonaws.auth.AWSStaticCredentialsProvider
import com.amazonaws.auth.BasicAWSCredentials
import com.amazonaws.services.cognitoidp.AWSCognitoIdentityProvider
import com.amazonaws.services.cognitoidp.AWSCognitoIdentityProviderClientBuilder
import com.amazonaws.services.cognitoidp.model.AdminInitiateAuthRequest
import com.amazonaws.services.cognitoidp.model.AttributeType
import com.amazonaws.services.cognitoidp.model.AuthFlowType
import com.amazonaws.services.cognitoidp.model.ConfirmSignUpRequest
import com.amazonaws.services.cognitoidp.model.SignUpRequest
import de.ruegnerlukas.strategygame.backend.ports.models.AuthResult
import de.ruegnerlukas.strategygame.backend.ports.required.UserManagementClient


class AwsCognito(private val provider: AWSCognitoIdentityProvider, private val clientId: String) : UserManagementClient {

	companion object {
		/**
		 * @param clientId The ID of the client associated with the user pool
		 * @param accessKey the AWS-User access key
		 * @param secretKey the AWS-User secret access key
		 * @param region the region to use
		 */
		fun create(clientId: String, accessKey: String, secretKey: String, region: String): AwsCognito {
			val provider = AWSCognitoIdentityProviderClientBuilder
				.standard()
				.withRegion(region)
				.withCredentials(AWSStaticCredentialsProvider(BasicAWSCredentials(accessKey, secretKey)))
				.build()
			return AwsCognito(provider, clientId)
		}
	}

	override fun signUp(email: String, password: String, username: String) {
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
	}

	override fun confirmSignUp(email: String, confirmationCode: String) {
		provider.confirmSignUp(
			ConfirmSignUpRequest()
				.withClientId(clientId)
				.withUsername(email)
				.withConfirmationCode(confirmationCode)
		)
	}

	override fun authenticate(email: String, password: String): AuthResult {
		val authRequest = AdminInitiateAuthRequest()
			.withAuthFlow(AuthFlowType.ADMIN_NO_SRP_AUTH)
			.withUserPoolId("TODO") // TODO
			.withClientId(clientId)
			.withAuthParameters(
				mapOf(
					"USERNAME" to email,
					"PASSWORD" to password
				)
			)
		val authResult = provider.adminInitiateAuth(authRequest).authenticationResult
		return AuthResult(
			idToken = authResult.idToken,
			accessToken = authResult.accessToken,
			refreshToken = authResult.refreshToken,
		)
	}

	override fun refreshAuthentication(refreshToken: String): AuthResult {
		val authRequest = AdminInitiateAuthRequest()
			.withAuthFlow(AuthFlowType.REFRESH_TOKEN_AUTH)
			.withClientId(clientId)
			.withAuthParameters(mapOf("REFRESH_TOKEN" to refreshToken))
		val authResult = provider.adminInitiateAuth(authRequest).authenticationResult
		return AuthResult(
			idToken = authResult.idToken,
			accessToken = authResult.accessToken,
			refreshToken = authResult.refreshToken,
		)
	}

	override fun delete() {
		TODO("Not yet implemented")
	}

//	fun signUp(email: String, password: String): SignUpResult {
//		val request = SignUpRequest()
//			.withClientId(clientId)
//			.withUsername(email)
//			.withPassword(password)
//			.withUserAttributes(
//				AttributeType()
//					.withName("nickname")
//					.withValue("nickname-$email")
//			)
//		return provider.signUp(request)
//	}

}