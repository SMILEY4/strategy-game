package io.github.smiley4.strategygame.engine

import io.github.smiley4.ktoropenapi.route
import io.github.smiley4.ktorplus.WebSocketContext
import io.github.smiley4.strategygame.engine.game.GameService
import io.github.smiley4.strategygame.engine.game.domain.GameNotificationService
import io.github.smiley4.strategygame.engine.game.domain.GameRepository
import io.github.smiley4.strategygame.engine.game.domain.GameServiceImpl
import io.github.smiley4.strategygame.engine.game.eventhandler.GameGenerationRequestedEventHandler
import io.github.smiley4.strategygame.engine.game.eventhandler.MatchDeletedEventHandler
import io.github.smiley4.strategygame.engine.game.infrastructure.InMemoryGameRepository
import io.github.smiley4.strategygame.engine.game.infrastructure.WebsocketNotificationService
import io.github.smiley4.strategygame.engine.routing.GameWebsocketRoute.GameConnection
import io.github.smiley4.strategygame.engine.routing.GameWebsocketRoute.ServerGameMessage
import io.github.smiley4.strategygame.engine.routing.routeGameWebsocket
import io.github.smiley4.strategygame.engine.simulation.GameStateRepository
import io.github.smiley4.strategygame.engine.simulation.SimulationService
import io.github.smiley4.strategygame.engine.simulation.generation.WorldGenerator
import io.github.smiley4.strategygame.engine.simulation.infrastructure.InMemoryGameStateRepository
import io.github.smiley4.strategygame.engine.simulation.playerstate.PlayerStateBuilder
import io.github.smiley4.strategygame.engine.simulation.turn.TurnService
import io.github.smiley4.strategygame.shared.infrastructure.RoutingAuthConstants
import io.ktor.server.auth.authenticate
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.get
import org.koin.core.module.Module
import org.koin.core.module.dsl.createdAtStart
import org.koin.core.module.dsl.withOptions
import org.koin.ktor.ext.inject

/**
 * Register engine module dependencies in the Koin container.
 */
fun Module.dependenciesEngine() {

    single<WebSocketContext<GameConnection, ServerGameMessage>> { WebSocketContext.create<GameConnection, ServerGameMessage>() }

    single<GameService> { GameServiceImpl(get(), get(), get(), get()) }
    single<GameNotificationService> { WebsocketNotificationService(get()) }
    single<GameRepository> { InMemoryGameRepository() }

    single { GameGenerationRequestedEventHandler(get(), get()) }.withOptions { createdAtStart() }
    single { MatchDeletedEventHandler(get(), get()) }.withOptions { createdAtStart() }

    single<TurnService> { TurnService() }
    single<SimulationService> { SimulationService(get(), get(), get(), get()) }
    single<GameStateRepository> { InMemoryGameStateRepository() }
    single<PlayerStateBuilder> { PlayerStateBuilder() }
    single<WorldGenerator> { WorldGenerator() }

}

/**
 * Configure engine-related routes under the /api/engine prefix.
 */
fun Route.routingEngine() {
    route("engine", {
        description = "Gameplay handling"
        tags("engine")
    }) {
        val context by inject<WebSocketContext<GameConnection, ServerGameMessage>>()
        authenticate(RoutingAuthConstants.AUTHKEY_USER_OTT_WEBSOCKET) {
            route("/game/{gameId}") { routeGameWebsocket(context) }
        }
    }
}