package de.ruegnerlukas.strategygame.backend.config

import com.auth0.jwk.JwkProvider
import com.auth0.jwk.JwkProviderBuilder
import com.auth0.jwt.JWT
import com.auth0.jwt.JWTVerifier
import com.auth0.jwt.algorithms.Algorithm
import com.auth0.jwt.exceptions.JWTVerificationException
import com.auth0.jwt.interfaces.DecodedJWT
import com.auth0.jwt.interfaces.RSAKeyProvider
import de.ruegnerlukas.strategygame.backend.shared.config.Config
import io.ktor.server.auth.jwt.JWTCredential
import io.ktor.server.auth.jwt.JWTPrincipal
import java.security.interfaces.RSAPrivateKey
import java.security.interfaces.RSAPublicKey
import java.util.concurrent.TimeUnit


internal fun jwkIssuer(): String {
	val region = Config.get().aws.region
	val poolId = Config.get().aws.cognito.poolId
	return "https://cognito-idp.$region.amazonaws.com/$poolId"
}


internal fun jwkProvider(): JwkProvider {
	// jwk = "json web key" ( = public keys)
	return JwkProviderBuilder(jwkIssuer())
		.cached(10, 24, TimeUnit.HOURS)
		.rateLimited(10, 1, TimeUnit.MINUTES)
		.build()
}


internal fun validateJwt(credential: JWTCredential): JWTPrincipal? {
	val jwtAudience = Config.get().aws.cognito.clientId
	return if (credential.payload.audience.contains(jwtAudience)) {
		JWTPrincipal(credential.payload)
	} else {
		null
	}
}


internal fun verifyJwt(token: String): Boolean {
	return try {
		val verifier: JWTVerifier = JWT
			.require(Algorithm.RSA256(AwsCognitoRSAKeyProvider()))
			.build()
		verifier.verify(token)
		true
	} catch (exception: JWTVerificationException) {
		false
	}
}

internal fun extractUserIdFromJwt(token: String): String {
	return JWT.decode(token).subject
}

internal class AwsCognitoRSAKeyProvider : RSAKeyProvider {

	private val provider = jwkProvider()

	override fun getPublicKeyById(keyId: String?): RSAPublicKey {
		return provider.get(keyId).publicKey as RSAPublicKey
	}

	override fun getPrivateKey(): RSAPrivateKey? = null

	override fun getPrivateKeyId(): String? = null

}