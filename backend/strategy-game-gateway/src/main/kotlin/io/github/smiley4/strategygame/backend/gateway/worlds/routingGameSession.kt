package io.github.smiley4.strategygame.backend.gateway.worlds

import io.github.smiley4.strategygame.backend.commondata.GameConfig
import io.github.smiley4.strategygame.backend.gateway.worlds.RouteConfig.routeConfig
import io.github.smiley4.strategygame.backend.gateway.worlds.RouteCreate.routeCreate
import io.github.smiley4.strategygame.backend.gateway.worlds.RouteDelete.routeDelete
import io.github.smiley4.strategygame.backend.gateway.worlds.RouteDisconnectAll.routeDisconnectAll
import io.github.smiley4.strategygame.backend.gateway.worlds.RouteJoin.routeJoin
import io.github.smiley4.strategygame.backend.gateway.worlds.RouteList.routeList
import io.github.smiley4.strategygame.backend.gateway.worlds.RouteWebsocket.routeWebsocket
import io.github.smiley4.strategygame.backend.gateway.worlds.RouteWebsocketTicket.routeWebsocketTicket
import io.github.smiley4.strategygame.backend.worlds.edge.ConnectToGame
import io.github.smiley4.strategygame.backend.worlds.edge.CreateGame
import io.github.smiley4.strategygame.backend.worlds.edge.DeleteGame
import io.github.smiley4.strategygame.backend.worlds.edge.DisconnectAllPlayers
import io.github.smiley4.strategygame.backend.worlds.edge.DisconnectFromGame
import io.github.smiley4.strategygame.backend.worlds.edge.JoinGame
import io.github.smiley4.strategygame.backend.worlds.edge.ListGames
import io.github.smiley4.strategygame.backend.worlds.edge.RequestConnectionToGame
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
    val messageHandler by inject<GatewayGameMessageHandler>()
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