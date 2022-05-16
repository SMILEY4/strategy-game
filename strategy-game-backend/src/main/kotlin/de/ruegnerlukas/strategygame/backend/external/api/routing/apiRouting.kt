package de.ruegnerlukas.strategygame.backend.external.api.routing

import de.ruegnerlukas.strategygame.backend.external.api.MessageHandler
import de.ruegnerlukas.strategygame.backend.external.awscognito.AwsCognito
import de.ruegnerlukas.strategygame.backend.ports.provided.CloseConnectionAction
import de.ruegnerlukas.strategygame.backend.ports.provided.CreateNewWorldAction
import de.ruegnerlukas.strategygame.backend.shared.websocket.ConnectionHandler
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.Application
import io.ktor.server.application.call
import io.ktor.server.auth.authenticate
import io.ktor.server.response.respond
import io.ktor.server.routing.get
import io.ktor.server.routing.route
import io.ktor.server.routing.routing

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
			userRoutes(cognito)
			worldRoutes(createNewWorldAction)
			websocketRoutes(connectionHandler, messageHandler, closeConnectionAction)
			get("/ping") {
				call.respond("Pong! ${System.currentTimeMillis()}")
			}
			get("/health") {
				call.respond(HttpStatusCode.OK, "Healthy ${System.currentTimeMillis()}")
			}
			authenticate {
				get("/authping") {
					call.respond("Auth-Pong! ${System.currentTimeMillis()}")
				}
			}
		}
	}
}