package de.ruegnerlukas.strategygame.backend.external.api.routing

import de.ruegnerlukas.strategygame.backend.external.api.MessageHandler
import de.ruegnerlukas.strategygame.backend.external.awscognito.AwsCognito
import de.ruegnerlukas.strategygame.backend.ports.provided.CloseConnectionAction
import de.ruegnerlukas.strategygame.backend.ports.provided.CreateNewWorldAction
import de.ruegnerlukas.strategygame.backend.ports.provided.gamelobby.CreateGameLobbyAction
import de.ruegnerlukas.strategygame.backend.shared.websocket.ConnectionHandler
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.Application
import io.ktor.server.application.ApplicationCall
import io.ktor.server.application.call
import io.ktor.server.auth.jwt.JWTPrincipal
import io.ktor.server.auth.principal
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
	createGameLobbyAction: CreateGameLobbyAction,
	closeConnectionAction: CloseConnectionAction,
	cognito: AwsCognito
) {
	routing {
		route("api") {
			userRoutes(cognito)
			worldRoutes(createNewWorldAction)
			gameLobbyRoutes(createGameLobbyAction)
			websocketRoutes(connectionHandler, messageHandler, closeConnectionAction)
			get("/health") {
				call.respond(HttpStatusCode.OK, "Healthy ${System.currentTimeMillis()}")
			}
		}
	}
}


/**
 * Get the id of the user making an (authenticated) http-request
 * @param call the request
 * @return the user id
 * */
fun getUserIdOrThrow(call: ApplicationCall): String {
	val principal = call.principal<JWTPrincipal>() ?: throw Exception("No JWT-Principal attached to call")
	return principal.payload.subject ?: throw Exception("No subject found in JWT-Principal")
}


/**
 * Get the id of the user making an (authenticated) http-request
 * @param call the request
 * @return the user id or null
 * */
fun getUserId(call: ApplicationCall): String? {
	return call.principal<JWTPrincipal>()?.payload?.subject
}