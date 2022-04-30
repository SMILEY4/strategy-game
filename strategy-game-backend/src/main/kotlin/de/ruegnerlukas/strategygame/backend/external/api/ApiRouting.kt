package de.ruegnerlukas.strategygame.backend.external.api

import de.ruegnerlukas.strategygame.backend.external.awscognito.AwsCognito
import de.ruegnerlukas.strategygame.backend.external.api.models.AuthData
import de.ruegnerlukas.strategygame.backend.external.api.models.UserConfirmationData
import de.ruegnerlukas.strategygame.backend.ports.provided.CloseConnectionAction
import de.ruegnerlukas.strategygame.backend.ports.provided.CreateNewWorldAction
import de.ruegnerlukas.strategygame.backend.shared.websocket.ConnectionHandler
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.Application
import io.ktor.server.application.call
import io.ktor.server.auth.authenticate
import io.ktor.server.auth.jwt.JWTPrincipal
import io.ktor.server.auth.principal
import io.ktor.server.request.receive
import io.ktor.server.response.respond
import io.ktor.server.response.respondText
import io.ktor.server.routing.get
import io.ktor.server.routing.post
import io.ktor.server.routing.route
import io.ktor.server.routing.routing
import io.ktor.server.websocket.webSocket
import io.ktor.websocket.Frame
import io.ktor.websocket.readText
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.json.Json

/**
 * Main configuration for all routes
 */
fun Application.apiRoutes(
	connectionHandler: ConnectionHandler,
	messageHandler: MessageHandler,
	createNewWorldAction: CreateNewWorldAction,
	closeConnectionAction: CloseConnectionAction,
	cognito: AwsCognito
) {
	routing {
		route("api") {
			route("user") {
				post("signup") {
					call.receive<AuthData>().let {
						cognito.signUp(it.email, it.password, it.username)
						call.respond(HttpStatusCode.OK)
					}
				}
				post("login") {
					call.receive<AuthData>().let {
						val result = cognito.authenticate(it.email, it.password)
						call.respond(HttpStatusCode.OK, result)
					}
				}
				post("confirm") {
					call.receive<UserConfirmationData>().let {
						cognito.confirmSignUp(it.email, it.code)
						call.respond(HttpStatusCode.OK)
					}
				}
				authenticate {
					// requires header
					// "Authorization" = Bearer {AuthResult.idToken}
					get("protected") {
						val principal = call.principal<JWTPrincipal>()
						val username = principal!!.payload.getClaim("username").asString()
						val expiresAt = principal.expiresAt?.time?.minus(System.currentTimeMillis())
						call.respondText("Hello, $username! Token is expired at $expiresAt ms.")
					}
				}
			}
			route("world") {
				post("create") {
					createNewWorldAction.perform()
						.onSuccess { call.respond(HttpStatusCode.OK, it) }
						.onFailure { call.respond(HttpStatusCode.InternalServerError, it.message ?: "") }
				}
				webSocket("messages") {
					val connectionId = connectionHandler.openSession(this)
					try {
						for (frame in incoming) {
							when (frame) {
								is Frame.Text -> messageHandler.onMessage(connectionId, Json.decodeFromString(frame.readText()))
								else -> print("Unknown frame-type: ${frame.frameType}")
							}
						}
					} finally {
						connectionHandler.closeSession(connectionId)
						closeConnectionAction.perform(connectionId)
					}
				}
			}
		}
	}
}