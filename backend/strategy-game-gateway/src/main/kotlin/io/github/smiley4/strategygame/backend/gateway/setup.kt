package io.github.smiley4.strategygame.backend.gateway

import io.github.smiley4.ktorwebsocketsextended.WSExtended
import io.github.smiley4.ktorwebsocketsextended.session.WebSocketConnectionHandler
import io.github.smiley4.strategygame.backend.gateway.users.routingUsers
import io.github.smiley4.strategygame.backend.gateway.worlds.GatewayGameMessageHandler
import io.github.smiley4.strategygame.backend.gateway.worlds.GatewayGameMessageProducer
import io.github.smiley4.strategygame.backend.gateway.worlds.routingGameSession
import io.github.smiley4.strategygame.backend.gateway.worlds.websocket.MessageProducer
import io.github.smiley4.strategygame.backend.gateway.worlds.websocket.WebSocketMessageProducer
import io.github.smiley4.strategygame.backend.worlds.edge.GameMessageProducer
import io.ktor.server.routing.Route
import org.koin.core.module.Module

fun Module.dependenciesGateway() {
    single<WebSocketConnectionHandler> { WSExtended.getConnectionHandler() }
    single<MessageProducer> { WebSocketMessageProducer(get()) }
    single<GameMessageProducer> { GatewayGameMessageProducer(get()) }
    single<GatewayGameMessageHandler> { GatewayGameMessageHandler(get()) }
}

fun Route.routingGateway() {
    routingUsers()
    routingGameSession()
}