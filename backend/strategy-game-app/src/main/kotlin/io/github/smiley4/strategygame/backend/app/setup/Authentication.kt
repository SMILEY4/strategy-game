package io.github.smiley4.strategygame.backend.app.setup

import io.github.smiley4.strategygame.backend.common.Config
import io.github.smiley4.strategygame.backend.common.ErrorResponse
import io.github.smiley4.strategygame.backend.users.authentication.UserIdentityService
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.Application
import io.ktor.server.application.install
import io.ktor.server.auth.Authentication
import io.ktor.server.auth.UserIdPrincipal
import io.ktor.server.auth.basic
import io.ktor.server.auth.jwt.jwt
import io.ktor.server.response.respond
import org.koin.ktor.ext.inject

/**
 * Configure authentication.
 */
fun Application.setupAuthentication() {
    val userIdentityService by inject<UserIdentityService>()
    install(Authentication) {
        jwt("user") {
            userIdentityService.configureAuthentication(this)
            challenge { _, _ ->
                ErrorResponse.unauthorized().also { response ->
                    call.respond(HttpStatusCode.fromValue(response.status), response)
                }
            }
        }
        basic("auth-technical-user") {
            realm = "strategy-game"
            validate { credentials ->
                val username = Config.get().admin.username
                val password = Config.get().admin.password
                if (credentials.name == username && credentials.password == password) {
                    UserIdPrincipal(credentials.name)
                } else {
                    null
                }
            }
        }
    }
}