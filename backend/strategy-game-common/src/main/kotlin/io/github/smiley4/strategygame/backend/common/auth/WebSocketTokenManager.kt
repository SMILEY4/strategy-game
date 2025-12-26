@file:OptIn(ExperimentalTime::class)

package io.github.smiley4.strategygame.backend.common.auth

import io.github.smiley4.strategygame.backend.commondata.Game
import io.github.smiley4.strategygame.backend.commondata.User
import java.security.SecureRandom
import java.util.Base64
import kotlin.time.Clock
import kotlin.time.Duration
import kotlin.time.ExperimentalTime
import kotlin.time.Instant

class WebSocketTokenManager {

    private val secureRandom = SecureRandom()
    private val tokens = mutableListOf<Token>()

    fun generate(timeToLive: Duration, userId: User.Id, gameId: Game.Id): String {
        val token = Token(
            token = generateSecureToken(),
            expiryTime = Clock.System.now().plus(timeToLive),
            principal = WsTokenPrincipal(
                gameId = gameId,
                userId = userId,
            )
        )
        tokens.add(token)
        return token.token
    }

    private fun generateSecureToken(bytes: Int = 32): String {
        val buffer = ByteArray(bytes)
        secureRandom.nextBytes(buffer)
        return Base64.getUrlEncoder()
            .withoutPadding()
            .encodeToString(buffer)
    }

    fun consume(token: String): WsTokenPrincipal {
        val token = tokens.find { it.token == token } ?: throw InvalidWebSocketTokenException()
        tokens.remove(token)
        if (token.expiryTime < Clock.System.now()) {
            throw InvalidWebSocketTokenException()
        }
        return token.principal
    }

    fun cleanup() {
        tokens.removeIf { it.expiryTime < Clock.System.now() }
    }

    data class Token(
        val token: String,
        val expiryTime: Instant,
        val principal: WsTokenPrincipal
    )

}