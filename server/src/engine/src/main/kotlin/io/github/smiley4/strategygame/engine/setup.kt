package io.github.smiley4.strategygame.engine

import io.github.smiley4.ktoropenapi.route
import io.github.smiley4.ktorplus.WebSocketContext
import io.github.smiley4.strategygame.engine.domain.GameEngineServiceImpl
import io.github.smiley4.strategygame.engine.domain.GameNotificationService
import io.github.smiley4.strategygame.engine.domain.GameRepository
import io.github.smiley4.strategygame.engine.domain.GameplayEngine
import io.github.smiley4.strategygame.engine.gameplay.GameStateRepository
import io.github.smiley4.strategygame.engine.gameplay.GameplayEngineImpl
import io.github.smiley4.strategygame.engine.infrastructure.InMemoryGameRepository
import io.github.smiley4.strategygame.engine.infrastructure.WebsocketNotificationService
import io.github.smiley4.strategygame.engine.infrastructure.WebsocketSessionManager
import io.github.smiley4.strategygame.engine.routing.GameWebsocketRoute.GameConnection
import io.github.smiley4.strategygame.engine.routing.GameWebsocketRoute.ServerGameMessage
import io.github.smiley4.strategygame.engine.routing.routeGameWebsocket
import io.github.smiley4.strategygame.shared.infrastructure.RoutingAuthConstants
import io.ktor.server.auth.authenticate
import io.ktor.server.routing.Route
import org.koin.core.module.Module
import org.koin.ktor.ext.inject

fun Module.dependenciesEngine() {

    single<WebSocketContext<GameConnection, ServerGameMessage>> { WebSocketContext.create<GameConnection, ServerGameMessage>() }
    single<WebsocketSessionManager> { WebsocketSessionManager() }
    single<GameNotificationService> { WebsocketNotificationService(get()) }

    single<GameStateRepository> { InMemoryGameRepository() }
    single<GameRepository> { InMemoryGameRepository() }

    single<GameplayEngine> { GameplayEngineImpl(get(), get()) }

    single<GameEngineService> { GameEngineServiceImpl(get(), get()) }

}

fun Route.routingEngine() {
    route("engine", {
        description = "Gameplay handling"
        tags("engine")
    }) {
        val context by inject<WebSocketContext<GameConnection, ServerGameMessage>>()
        authenticate(RoutingAuthConstants.AUTHKEY_USER_OTT_WEBSOCKET) {
            route("/game") { routeGameWebsocket(context) }
        }
    }
}