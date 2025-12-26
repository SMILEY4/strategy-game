package io.github.smiley4.strategygame.backend.app.setup

import io.github.smiley4.strategygame.backend.common.Config
import io.github.smiley4.strategygame.backend.common.HttpErrorResponse
import io.github.smiley4.strategygame.backend.common.auth.WebSocketTokenManager
import io.github.smiley4.strategygame.backend.common.auth.webSocketToken
import io.github.smiley4.strategygame.backend.common.unauthorized
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

const val AUTH_KEY_USER = "user"
const val AUTH_KEY_GAME_EVENTS = "game-events"
const val AUTH_KEY_TECHNICAL = "auth-technical-user"


/**
 * Configure authentication.
 */
fun Application.setupAuthentication() {
    val userIdentityService by inject<UserIdentityService>()
    val websocketTokenManager by inject<WebSocketTokenManager>()
    install(Authentication) {
        jwt(AUTH_KEY_USER) {
            userIdentityService.configureAuthentication(this)
            challenge { _, _ ->
                HttpErrorResponse.unauthorized().also { response ->
                    call.respond(HttpStatusCode.fromValue(response.status), response)
                }
            }
        }
        webSocketToken(AUTH_KEY_GAME_EVENTS) {
            manager = websocketTokenManager
            extractToken = { call -> call.parameters["token"] }
        }
        basic(AUTH_KEY_TECHNICAL) {
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