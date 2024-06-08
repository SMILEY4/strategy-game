package io.github.smiley4.strategygame.backend.worlds.external.api

import io.github.smiley4.strategygame.backend.common.models.GameConfig
import io.github.smiley4.strategygame.backend.worlds.external.api.RouteConfig.routeConfig
import io.github.smiley4.strategygame.backend.worlds.external.api.RouteCreate.routeCreate
import io.github.smiley4.strategygame.backend.worlds.external.api.RouteDelete.routeDelete
import io.github.smiley4.strategygame.backend.worlds.external.api.RouteDisconnectAll.routeDisconnectAll
import io.github.smiley4.strategygame.backend.worlds.external.api.RouteJoin.routeJoin
import io.github.smiley4.strategygame.backend.worlds.external.api.RouteList.routeList
import io.github.smiley4.strategygame.backend.worlds.external.api.RouteWebsocket.routeWebsocket
import io.github.smiley4.strategygame.backend.worlds.external.api.RouteWebsocketTicket.routeWebsocketTicket
import io.github.smiley4.strategygame.backend.worlds.external.message.handler.MessageHandler
import io.github.smiley4.strategygame.backend.worlds.ports.provided.ConnectToGame
import io.github.smiley4.strategygame.backend.worlds.ports.provided.CreateGame
import io.github.smiley4.strategygame.backend.worlds.ports.provided.DeleteGame
import io.github.smiley4.strategygame.backend.worlds.ports.provided.DisconnectAllPlayers
import io.github.smiley4.strategygame.backend.worlds.ports.provided.DisconnectFromGame
import io.github.smiley4.strategygame.backend.worlds.ports.provided.JoinGame
import io.github.smiley4.strategygame.backend.worlds.ports.provided.ListGames
import io.github.smiley4.strategygame.backend.worlds.ports.provided.RequestConnectionToGame
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