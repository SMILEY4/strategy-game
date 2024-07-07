package io.github.smiley4.strategygame.backend.users.module.iam

import com.auth0.jwt.JWT
import com.auth0.jwt.JWTVerifier
import com.auth0.jwt.algorithms.Algorithm
import com.auth0.jwt.exceptions.JWTVerificationException
import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.users.edge.UserIdentityService
import io.github.smiley4.strategygame.backend.users.edge.models.AuthData
import io.github.smiley4.strategygame.backend.users.edge.models.AuthDataExtended
import io.ktor.server.auth.jwt.JWTAuthenticationProvider
import io.ktor.server.auth.jwt.JWTCredential
import io.ktor.server.auth.jwt.JWTPrincipal
import java.util.Date
import kotlin.time.Duration.Companion.hours

internal class DummyUserIdentityService : UserIdentityService, Logging {

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

    init {
        log().warn("Using dummy identity service. DO NOT USE IN PRODUCTION !!!")
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

    override fun authenticate(email: String, password: String): AuthDataExtended {
        return AuthDataExtended(
            idToken = makeToken(email),
            refreshToken = "someRefreshToken",
            accessToken = "someAccessToken",
        )
    }

    override fun createUser(email: String, password: String, username: String) {
        throw UnsupportedOperationException("DummyUserIdentityService does not support creating users")
    }

    override fun refreshAuthentication(refreshToken: String): AuthData {
        throw UnsupportedOperationException("DummyUserIdentityService does not support refreshing tokens")

    }

    override fun deleteUser(email: String, password: String) {
        throw UnsupportedOperationException("DummyUserIdentityService does not support deleting users")
    }

}