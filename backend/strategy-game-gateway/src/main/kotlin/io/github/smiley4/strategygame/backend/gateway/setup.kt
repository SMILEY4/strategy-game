package io.github.smiley4.strategygame.backend.gateway

import io.github.smiley4.strategygame.backend.commondata.GameConfig
import io.github.smiley4.strategygame.backend.gateway.users.RouteDelete.routeDelete
import io.github.smiley4.strategygame.backend.gateway.users.RouteLogin.routeLogin
import io.github.smiley4.strategygame.backend.gateway.users.RouteRefresh.routeRefresh
import io.github.smiley4.strategygame.backend.gateway.users.RouteSignup.routeSignup
import io.github.smiley4.strategygame.backend.gateway.websocket.auth.WebsocketTicketAuthManager
import io.github.smiley4.strategygame.backend.gateway.websocket.session.WebSocketConnectionHandler
import io.github.smiley4.strategygame.backend.gateway.worlds.GatewayGameMessageHandler
import io.github.smiley4.strategygame.backend.gateway.worlds.GatewayGameMessageProducer
import io.github.smiley4.strategygame.backend.gateway.worlds.RouteConfig.routeConfig
import io.github.smiley4.strategygame.backend.gateway.worlds.RouteCreate.routeCreate
import io.github.smiley4.strategygame.backend.gateway.worlds.RouteDelete.routeDelete
import io.github.smiley4.strategygame.backend.gateway.worlds.RouteDisconnectAll.routeDisconnectAll
import io.github.smiley4.strategygame.backend.gateway.worlds.RouteJoin.routeJoin
import io.github.smiley4.strategygame.backend.gateway.worlds.RouteList.routeList
import io.github.smiley4.strategygame.backend.gateway.worlds.RouteWebsocket.routeWebsocket
import io.github.smiley4.strategygame.backend.gateway.worlds.RouteWebsocketTicket.routeWebsocketTicket
import io.github.smiley4.strategygame.backend.gateway.websocket.messages.MessageProducer
import io.github.smiley4.strategygame.backend.gateway.websocket.messages.WebSocketMessageProducer
import io.github.smiley4.strategygame.backend.users.edge.CreateUser
import io.github.smiley4.strategygame.backend.users.edge.DeleteUser
import io.github.smiley4.strategygame.backend.users.edge.LoginUser
import io.github.smiley4.strategygame.backend.users.edge.RefreshUserToken
import io.github.smiley4.strategygame.backend.worlds.edge.ConnectToGame
import io.github.smiley4.strategygame.backend.worlds.edge.CreateGame
import io.github.smiley4.strategygame.backend.worlds.edge.DeleteGame
import io.github.smiley4.strategygame.backend.worlds.edge.DisconnectAllPlayers
import io.github.smiley4.strategygame.backend.worlds.edge.DisconnectFromGame
import io.github.smiley4.strategygame.backend.worlds.edge.GameMessageProducer
import io.github.smiley4.strategygame.backend.worlds.edge.JoinGame
import io.github.smiley4.strategygame.backend.worlds.edge.ListGames
import io.github.smiley4.strategygame.backend.worlds.edge.RequestConnectionToGame
import io.ktor.server.auth.authenticate
import io.ktor.server.routing.Route
import io.ktor.server.routing.route
import org.koin.core.module.Module
import org.koin.ktor.ext.inject

fun Module.dependenciesGateway() {
    single<WebsocketTicketAuthManager> { TODO() }
    single<WebSocketConnectionHandler> { TODO() }
    single<MessageProducer> { WebSocketMessageProducer(get()) }
    single<GameMessageProducer> { GatewayGameMessageProducer(get()) }
    single<GatewayGameMessageHandler> { GatewayGameMessageHandler(get()) }
}

fun Route.routingGateway() {

    val userCreate by inject<CreateUser>()
    val userLogin by inject<LoginUser>()
    val userRefresh by inject<RefreshUserToken>()
    val userDelete by inject<DeleteUser>()
    route("user") {
        routeLogin(userLogin)
        routeRefresh(userRefresh)
        routeSignup(userCreate)
        authenticate("user") {
            routeDelete(userDelete)
        }
    }

    val wsTicketManager by inject<WebsocketTicketAuthManager>()
    val wsConnectionHandler by inject<WebSocketConnectionHandler>()
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
            routeWebsocketTicket(wsTicketManager)
        }
        authenticate("auth-technical-user") {
            routeDisconnectAll(disconnectAll)
        }
        routeWebsocket(wsTicketManager, wsConnectionHandler, messageHandler, disconnectAction, requestConnection, connectAction)
    }

}