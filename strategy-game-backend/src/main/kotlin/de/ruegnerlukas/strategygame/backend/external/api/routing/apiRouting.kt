package de.ruegnerlukas.strategygame.backend.external.api.routing

import de.ruegnerlukas.strategygame.backend.external.api.websocket.ConnectionHandler
import de.ruegnerlukas.strategygame.backend.external.api.websocket.MessageHandler
import de.ruegnerlukas.strategygame.backend.external.api.websocket.WebsocketUtils
import de.ruegnerlukas.strategygame.backend.ports.provided.gamelobby.GameLobbiesListAction
import de.ruegnerlukas.strategygame.backend.ports.provided.gamelobby.GameLobbyConnectAction
import de.ruegnerlukas.strategygame.backend.ports.provided.gamelobby.GameLobbyCreateAction
import de.ruegnerlukas.strategygame.backend.ports.provided.gamelobby.GameLobbyDisconnectAction
import de.ruegnerlukas.strategygame.backend.ports.provided.gamelobby.GameLobbyJoinAction
import de.ruegnerlukas.strategygame.backend.ports.provided.gamelobby.GameLobbyRequestConnectionAction
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
	userIdentityService: UserIdentityService,
	gameLobbyCreateAction: GameLobbyCreateAction,
	gameLobbyJoinAction: GameLobbyJoinAction,
	gameLobbiesListAction: GameLobbiesListAction,
	gameLobbyDisconnectAction: GameLobbyDisconnectAction,
	gameLobbyRequestConnectionAction: GameLobbyRequestConnectionAction,
	gameLobbyConnectAction: GameLobbyConnectAction
) {
	routing {
		route("api") {
			userRoutes(userIdentityService)
			gameLobbyRoutes(gameLobbyCreateAction, gameLobbyJoinAction, gameLobbiesListAction)
			gameWebsocketRoutes(
				connectionHandler,
				userIdentityService,
				messageHandler,
				gameLobbyDisconnectAction,
				gameLobbyRequestConnectionAction,
				gameLobbyConnectAction
			)
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
