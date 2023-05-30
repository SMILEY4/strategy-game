package de.ruegnerlukas.strategygame.backend.user.external.client

import arrow.core.Either
import com.auth0.jwt.JWT
import com.auth0.jwt.JWTVerifier
import com.auth0.jwt.algorithms.Algorithm
import com.auth0.jwt.exceptions.JWTVerificationException
import de.ruegnerlukas.strategygame.backend.user.ports.models.AuthData
import de.ruegnerlukas.strategygame.backend.user.ports.models.AuthDataExtended
import de.ruegnerlukas.strategygame.backend.user.ports.required.UserIdentityService
import io.ktor.server.auth.jwt.JWTAuthenticationProvider
import io.ktor.server.auth.jwt.JWTCredential
import io.ktor.server.auth.jwt.JWTPrincipal
import java.lang.UnsupportedOperationException
import java.util.Date
import kotlin.time.Duration.Companion.hours

class DummyUserIdentityService : UserIdentityService {

	companion object {

		private const val SECRET = "mysecret"
		private const val ISSUER = "dummy-identity-provider"
		private val VALIDITY_MS = 10.hours.inWholeMilliseconds

		private fun validateJwt(credential: JWTCredential): JWTPrincipal {
			return JWTPrincipal(credential.payload)
		}

		fun makeToken(userId: String): String {
			return JWT.create()
				.withSubject("Authentication")
				.withIssuer(ISSUER)
				.withClaim("id", userId)
				.withSubject(userId)
				.withExpiresAt(getExpiration())
				.sign(Algorithm.HMAC512(SECRET))
		}

		private fun getExpiration() = Date(System.currentTimeMillis() + VALIDITY_MS)

	}


	override fun configureAuthentication(config: JWTAuthenticationProvider.Config) {
		config.realm = "strategy-game"
		config.verifier(
			JWT
				.require(Algorithm.HMAC512(SECRET))
				.withIssuer(ISSUER)
				.build()
		)
		config.validate { credential -> validateJwt(credential) }
	}

	override fun extractUserId(jwtToken: String): String {
		return JWT.decode(jwtToken).subject

	}

	override fun verifyJwtToken(token: String): Boolean {
		return try {
			val verifier: JWTVerifier = JWT
				.require(Algorithm.HMAC512(SECRET))
				.withIssuer(ISSUER)
				.build()
			verifier.verify(token)
			true
		} catch (exception: JWTVerificationException) {
			false
		}
	}

	override fun authenticate(email: String, password: String): Either<UserIdentityService.AuthUserError, AuthDataExtended> {
		return Either.Right(
			AuthDataExtended(
				idToken = makeToken(email),
				refreshToken = "someRefreshToken",
				accessToken = "someAccessToken",
			)
		)
	}

	override fun createUser(email: String, password: String, username: String): Either<UserIdentityService.CreateUserError, Unit> {
		throw UnsupportedOperationException("DummyUserIdentityService does not support creating users")
	}

	override fun refreshAuthentication(refreshToken: String): Either<UserIdentityService.RefreshAuthError, AuthData> {
		throw UnsupportedOperationException("DummyUserIdentityService does not support refreshing tokens")

	}

	override suspend fun deleteUser(email: String, password: String): Either<UserIdentityService.DeleteUserError, Unit> {
		throw UnsupportedOperationException("DummyUserIdentityService does not support deleting users")
	}

}