package io.github.smiley4.strategygame.backend.common.auth

import io.ktor.server.application.ApplicationCall
import io.ktor.server.auth.AuthenticationConfig
import io.ktor.server.auth.AuthenticationContext
import io.ktor.server.auth.AuthenticationFailedCause
import io.ktor.server.auth.AuthenticationProvider
import io.ktor.server.auth.UnauthorizedResponse
import io.ktor.server.response.respond

fun AuthenticationConfig.webSocketToken(
    name: String? = null,
    configure: WebSocketTokenAuthenticationProvider.Config.() -> Unit
) {
    val provider = WebSocketTokenAuthenticationProvider(WebSocketTokenAuthenticationProvider.Config(name).apply(configure))
    if (provider.config.manager == null) {
        throw IllegalArgumentException("${WebSocketTokenManager::class.simpleName} must not be null")
    }
    if (provider.config.extractToken == null) {
        throw IllegalArgumentException("Token extractor must not be null")
    }
    register(provider)
}


class WebSocketTokenAuthenticationProvider(val config: Config) : AuthenticationProvider(config) {

    class Config(name: String?) : AuthenticationProvider.Config(name) {
        var manager: WebSocketTokenManager? = null
        var extractToken: ((call: ApplicationCall) -> String?)? = null
    }

    override suspend fun onAuthenticate(context: AuthenticationContext) {
        val manager = config.manager ?: throw IllegalArgumentException("${WebSocketTokenManager::class.simpleName} must not be null")
        val extractToken = config.extractToken ?: throw IllegalArgumentException("Token extractor must not be null")

        val token = extractToken(context.call)

        var cause: AuthenticationFailedCause? = null
        if (token == null) {
            cause = AuthenticationFailedCause.NoCredentials
        } else {
            try {
                val principal = manager.consume(token)
                context.principal(name, principal)
            } catch (_: Exception) {
                cause = AuthenticationFailedCause.InvalidCredentials
            }
        }

        if (cause != null) {
            context.challenge("WsTokenAuth", cause) { challenge, call ->
                call.respond(UnauthorizedResponse())
                challenge.complete()
            }
        }

    }

}

