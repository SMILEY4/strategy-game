package de.ruegnerlukas.strategygame.backend.gamesession.external.api

import de.ruegnerlukas.strategygame.backend.common.models.GameConfig
import de.ruegnerlukas.strategygame.backend.gamesession.external.api.RouteConfig.routeConfig
import de.ruegnerlukas.strategygame.backend.gamesession.external.api.RouteCreate.routeCreate
import de.ruegnerlukas.strategygame.backend.gamesession.external.api.RouteDelete.routeDelete
import de.ruegnerlukas.strategygame.backend.gamesession.external.api.RouteDisconnectAll.routeDisconnectAll
import de.ruegnerlukas.strategygame.backend.gamesession.external.api.RouteJoin.routeJoin
import de.ruegnerlukas.strategygame.backend.gamesession.external.api.RouteList.routeList
import de.ruegnerlukas.strategygame.backend.gamesession.external.api.RouteWebsocket.routeWebsocket
import de.ruegnerlukas.strategygame.backend.gamesession.external.api.RouteWebsocketTicket.routeWebsocketTicket
import de.ruegnerlukas.strategygame.backend.gamesession.external.message.handler.MessageHandler
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.ConnectToGame
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.CreateGame
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.DeleteGame
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.DisconnectAllPlayers
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.DisconnectFromGame
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.JoinGame
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.ListGames
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.RequestConnectionToGame
import io.ktor.server.auth.authenticate
import io.ktor.server.routing.Route
import io.ktor.server.routing.route
import org.koin.ktor.ext.inject

fun Route.routingGameSession() {
    val createGame by inject<CreateGame>()
    val joinGame by inject<JoinGame>()
    val listGames by inject<ListGames>()
    val deleteGame by inject<DeleteGame>()
    val gameConfig by inject<GameConfig>()
    val messageHandler by inject<MessageHandler>()
    val disconnectAction by inject<DisconnectFromGame>()
    val requestConnection by inject<RequestConnectionToGame>()
    val connectAction by inject<ConnectToGame>()
    val disconnectAll by inject<DisconnectAllPlayers>()
    route("session") {
        authenticate("user") {
            routeCreate(createGame, joinGame)
            routeJoin(joinGame)
            routeList(listGames)
            routeDelete(deleteGame)
            routeConfig(gameConfig)
            routeWebsocketTicket()
        }
        authenticate("auth-technical-user") {
            routeDisconnectAll(disconnectAll)
        }
        routeWebsocket(messageHandler, disconnectAction, requestConnection, connectAction)
    }
}