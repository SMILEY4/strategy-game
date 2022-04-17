package de.ruegnerlukas.strategygame.backend.external.api

import de.ruegnerlukas.strategygame.backend.core.ports.provided.WorldService
import de.ruegnerlukas.strategygame.backend.external.api.wscore.ConnectionHandler
import de.ruegnerlukas.strategygame.backend.external.api.wscore.WebSocketMessage
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.call
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.post
import io.ktor.server.routing.route
import io.ktor.server.websocket.webSocket
import io.ktor.websocket.Frame
import io.ktor.websocket.readText
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

/**
 * Configuration for all world routes
 */
fun Route.worldRoutes(connectionHandler: ConnectionHandler, worldService: WorldService, worldMessageDispatcher: WorldMessageDispatcher) {
	route("world") {
		post("create") {
			worldService.createNew()
				.onSuccess { call.respond(HttpStatusCode.OK, it) }
				.onFailure { call.respond(HttpStatusCode.InternalServerError, it.message ?: "") }
		}
		webSocket("messages") {
			val connectionId = connectionHandler.openSession(this)
			try {
				for (frame in incoming) {
					when (frame) {
						is Frame.Text -> {
							val message = Json.decodeFromString<WebSocketMessage>(frame.readText())
							worldMessageDispatcher.onMessage(connectionId, message)
						}
						else -> print("Unknown frame-type: $frame")
					}
				}
			} finally {
				connectionHandler.closeSession(connectionId)
			}
		}
	}
}