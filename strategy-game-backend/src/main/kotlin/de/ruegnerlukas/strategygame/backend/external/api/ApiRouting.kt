package de.ruegnerlukas.strategygame.backend.external.api

import de.ruegnerlukas.strategygame.backend.external.api.models.AuthData
import de.ruegnerlukas.strategygame.backend.external.api.models.CreateUserData
import de.ruegnerlukas.strategygame.backend.external.api.models.UserConfirmationData
import de.ruegnerlukas.strategygame.backend.external.awscognito.AwsCognito
import de.ruegnerlukas.strategygame.backend.ports.models.AuthResult
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
import io.ktor.server.routing.delete
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
					call.receive<CreateUserData>().let {
						val result = cognito.createUser(it.email, it.password, it.username)
						when {
							result.isSuccess() -> call.respond(HttpStatusCode.OK)
							result.isError("USERNAME_EXISTS") -> call.respond(HttpStatusCode.Conflict, result.getError())
							result.isError("INVALID_PASSWORD") -> call.respond(HttpStatusCode.BadRequest, result.getError())
							result.isError("CODE_DELIVERY_FAILURE") -> call.respond(HttpStatusCode.BadRequest, result.getError())
							result.isError() -> call.respond(HttpStatusCode.InternalServerError)
						}
					}
				}
				post("login") {
					call.receive<AuthData>().let {
						val result = cognito.authenticate(it.email, it.password)
						when {
							result.isSuccess() -> call.respond(HttpStatusCode.OK, AuthResult(result.getOrThrow()))
							result.isError("NOT_AUTHORIZED") -> call.respond(HttpStatusCode.Unauthorized, result.getError())
							result.isError("USER_NOT_CONFIRMED") -> call.respond(HttpStatusCode.Conflict, result.getError())
							result.isError("USER_NOT_FOUND") -> call.respond(HttpStatusCode.NotFound, result.getError())
							result.isError() -> call.respond(HttpStatusCode.InternalServerError)
						}
					}
				}
				post("confirm") {
					call.receive<UserConfirmationData>().let {
						val result = cognito.confirmUser(it.email, it.code)
						when {
							result.isSuccess() -> call.respond(HttpStatusCode.OK)
							result.isError("TOO_MANY_FAILED_ATTEMPTS") -> call.respond(HttpStatusCode.BadRequest, result.getError())
							result.isError("CODE_MISMATCH") -> call.respond(HttpStatusCode.Conflict, result.getError())
							result.isError("EXPIRED_CODE") -> call.respond(HttpStatusCode.BadRequest, result.getError())
							result.isError("USER_NOT_FOUND") -> call.respond(HttpStatusCode.NotFound, result.getError())
							result.isError() -> call.respond(HttpStatusCode.InternalServerError)
						}
					}
				}
				post("refresh") {
					call.receive<String>().let {
						val result = cognito.refreshAuthentication(it)
						when {
							result.isSuccess() -> call.respond(HttpStatusCode.OK, result.getOrThrow())
							result.isError("NOT_AUTHORIZED") -> call.respond(HttpStatusCode.Unauthorized, result.getError())
							result.isError("USER_NOT_CONFIRMED") -> call.respond(HttpStatusCode.Conflict, result.getError())
							result.isError("USER_NOT_FOUND") -> call.respond(HttpStatusCode.NotFound, result.getError())
							result.isError() -> call.respond(HttpStatusCode.InternalServerError)
						}
					}
				}
				authenticate {
					delete("delete") {
						call.receive<AuthData>().let {
							val result = cognito.deleteUser(it.email, it.password)
							when {
								result.isSuccess() -> call.respond(HttpStatusCode.OK)
								result.isError("USER_NOT_FOUND") -> call.respond(HttpStatusCode.NotFound, result.getError())
								result.isError() -> call.respond(HttpStatusCode.InternalServerError)
							}
						}
					}
					get("protected") {
						// temporary test route
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