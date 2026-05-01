package io.github.smiley4.strategygame.application.plugins

import io.github.smiley4.strategygame.identity.auth.AuthService
import io.github.smiley4.strategygame.identity.auth.domain.SessionToken
import io.github.smiley4.strategygame.shared.infrastructure.RoutingAuthConstants
import io.github.smiley4.strategygame.shared.infrastructure.UserPrincipal
import io.ktor.server.application.Application
import io.ktor.server.application.install
import io.ktor.server.auth.Authentication
import io.ktor.server.auth.bearer
import org.koin.ktor.ext.inject

fun Application.setupAuthentication() {
    val service by inject<AuthService>()
    install(Authentication) {
        bearer(RoutingAuthConstants.AUTH_USER) {
            authenticate { tokenCredentials ->
                try {
                    val userId = service.authenticate(SessionToken(tokenCredentials.token))
                    UserPrincipal(userId)
                } catch (_: Exception) {
                    null
                }
            }
        }
    }
}
