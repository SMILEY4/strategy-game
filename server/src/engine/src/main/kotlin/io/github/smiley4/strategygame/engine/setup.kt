package io.github.smiley4.strategygame.engine

import io.github.smiley4.ktoropenapi.route
import io.github.smiley4.ktorplus.WebSocketContext
import io.github.smiley4.strategygame.engine.game.GameEngineService
import io.github.smiley4.strategygame.engine.game.domain.GameGenerationRequestedEventHandler
import io.github.smiley4.strategygame.engine.game.domain.GameEngineServiceImpl
import io.github.smiley4.strategygame.engine.game.domain.GameNotificationService
import io.github.smiley4.strategygame.engine.game.domain.GameRepository
import io.github.smiley4.strategygame.engine.game.domain.MatchDeletedEventHandler
import io.github.smiley4.strategygame.engine.gameplay.GameplayEngine
import io.github.smiley4.strategygame.engine.gameplay.domain.GameStateRepository
import io.github.smiley4.strategygame.engine.gameplay.domain.GameplayEngineImpl
import io.github.smiley4.strategygame.engine.game.infrastructure.InMemoryGameRepository
import io.github.smiley4.strategygame.engine.game.infrastructure.WebsocketNotificationService
import io.github.smiley4.strategygame.engine.game.infrastructure.WebsocketSessionManager
import io.github.smiley4.strategygame.engine.gameplay.domain.EndTurnEventHandler
import io.github.smiley4.strategygame.engine.gameplay.infrastructure.InMemoryGameStateRepository
import io.github.smiley4.strategygame.engine.routing.GameWebsocketRoute.GameConnection
import io.github.smiley4.strategygame.engine.routing.GameWebsocketRoute.ServerGameMessage
import io.github.smiley4.strategygame.engine.routing.routeGameWebsocket
import io.github.smiley4.strategygame.shared.infrastructure.RoutingAuthConstants
import io.ktor.server.auth.authenticate
import io.ktor.server.routing.Route
import org.koin.core.module.Module
import org.koin.core.module.dsl.createdAtStart
import org.koin.core.module.dsl.withOptions
import org.koin.ktor.ext.inject

fun Module.dependenciesEngine() {

    single { GameGenerationRequestedEventHandler(get(), get()) }.withOptions { createdAtStart() }
    single { MatchDeletedEventHandler(get(), get()) }.withOptions { createdAtStart() }
    single { EndTurnEventHandler(get(), get()) }.withOptions { createdAtStart() }

    single<WebSocketContext<GameConnection, ServerGameMessage>> { WebSocketContext.create<GameConnection, ServerGameMessage>() }
    single<WebsocketSessionManager> { WebsocketSessionManager() }
    single<GameNotificationService> { WebsocketNotificationService(get()) }

    single<GameStateRepository> { InMemoryGameStateRepository() }
    single<GameRepository> { InMemoryGameRepository() }

    single<GameplayEngine> { GameplayEngineImpl(get(), get()) }

    single<GameEngineService> { GameEngineServiceImpl(get(), get(), get()) }

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