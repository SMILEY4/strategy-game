package de.ruegnerlukas.strategygame.backend.external.api

import de.ruegnerlukas.strategygame.backend.ports.provided.CloseConnectionAction
import de.ruegnerlukas.strategygame.backend.ports.provided.CreateNewWorldAction
import de.ruegnerlukas.strategygame.backend.shared.websocket.ConnectionHandler
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.Application
import io.ktor.server.application.call
import io.ktor.server.response.respond
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
	closeConnectionAction: CloseConnectionAction
) {
	routing {
		route("api") {
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