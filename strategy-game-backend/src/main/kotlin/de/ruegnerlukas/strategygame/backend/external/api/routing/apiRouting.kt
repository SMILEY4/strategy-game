package de.ruegnerlukas.strategygame.backend.external.api.routing

import de.ruegnerlukas.strategygame.backend.external.api.websocket.ConnectionHandler
import de.ruegnerlukas.strategygame.backend.external.api.websocket.MessageHandler
import de.ruegnerlukas.strategygame.backend.external.api.websocket.WebsocketUtils
import de.ruegnerlukas.strategygame.backend.ports.provided.CloseConnectionAction
import de.ruegnerlukas.strategygame.backend.ports.provided.CreateGameLobbyAction
import de.ruegnerlukas.strategygame.backend.ports.provided.JoinGameLobbyAction
import de.ruegnerlukas.strategygame.backend.ports.provided.JoinWorldAction
import de.ruegnerlukas.strategygame.backend.ports.provided.ListPlayerGameLobbiesAction
import de.ruegnerlukas.strategygame.backend.ports.provided.RequestConnectGameLobbyAction
import de.ruegnerlukas.strategygame.backend.ports.required.UserIdentityService
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
	createGameLobbyAction: CreateGameLobbyAction,
	joinGameLobbyAction: JoinGameLobbyAction,
	listGameLobbiesAction: ListPlayerGameLobbiesAction,
	requestConnectLobbyAction: RequestConnectGameLobbyAction,
	closeConnectionAction: CloseConnectionAction,
	userIdentityService: UserIdentityService,
	joinWorldAction: JoinWorldAction
) {
	routing {
		route("api") {
			userRoutes(userIdentityService)
			gameLobbyRoutes(createGameLobbyAction, joinGameLobbyAction, listGameLobbiesAction)
			gameWebsocketRoutes(connectionHandler, userIdentityService, messageHandler, closeConnectionAction, requestConnectLobbyAction, joinWorldAction)
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
 * Get the id of the user opening an (authenticated) websocket-connection
 * @param call the request
 * @return the user id
 * */
fun getWebsocketUserIdOrThrow(userService: UserIdentityService, call: ApplicationCall): String {
	return userService.extractUserId(call.request.queryParameters[WebsocketUtils.QUERY_PARAM_TOKEN]!!)
}
