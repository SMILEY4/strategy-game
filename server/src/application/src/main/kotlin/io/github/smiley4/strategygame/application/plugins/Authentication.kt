package io.github.smiley4.strategygame.application.plugins

import io.github.smiley4.strategygame.identity.auth.AuthService
import io.github.smiley4.strategygame.identity.auth.domain.OneTimeToken
import io.github.smiley4.strategygame.identity.auth.domain.SessionToken
import io.github.smiley4.strategygame.shared.infrastructure.RoutingAuthConstants
import io.github.smiley4.strategygame.shared.infrastructure.UserPrincipal
import io.ktor.http.auth.HttpAuthHeader
import io.ktor.server.application.Application
import io.ktor.server.application.install
import io.ktor.server.auth.Authentication
import io.ktor.server.auth.bearer
import org.koin.ktor.ext.inject

fun Application.setupAuthentication() {
    val service by inject<AuthService>()
    install(Authentication) {
        bearer(RoutingAuthConstants.AUTHKEY_USER_SESSION) {
            authenticate { tokenCredentials ->
                try {
                    val userId = service.authenticate(SessionToken(tokenCredentials.token))
                    UserPrincipal(userId)
                } catch (_: Exception) {
                    null
                }
            }
        }
        bearer(RoutingAuthConstants.AUTHKEY_USER_OTT_WEBSOCKET) {
            authHeader { call ->
                val token = call.request.queryParameters[RoutingAuthConstants.QUERY_PARAM_WS_TOKEN]
                if(token != null) {
                    HttpAuthHeader.Single("Bearer", token)
                } else {
                    null
                }
            }
            authenticate { tokenCredentials ->
                try {
                    val userId = service.authenticate(OneTimeToken(tokenCredentials.token))
                    UserPrincipal(userId)
                } catch (_: Exception) {
                    null
                }
            }
        }
    }
}
