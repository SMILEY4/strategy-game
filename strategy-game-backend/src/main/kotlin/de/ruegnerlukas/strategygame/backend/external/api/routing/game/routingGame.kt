package de.ruegnerlukas.strategygame.backend.external.api.routing.game

import de.ruegnerlukas.strategygame.backend.core.config.GameConfig
import de.ruegnerlukas.strategygame.backend.external.api.message.handler.MessageHandler
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameConnectAction
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameCreateAction
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameDeleteAction
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameDisconnectAction
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameJoinAction
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameRequestConnectionAction
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GamesListAction
import io.ktor.server.auth.authenticate
import io.ktor.server.routing.Route
import io.ktor.server.routing.route
import org.koin.ktor.ext.inject

fun Route.routingGame() {
    val createGame by inject<GameCreateAction>()
    val joinGame by inject<GameJoinAction>()
    val listGames by inject<GamesListAction>()
    val deleteGame by inject<GameDeleteAction>()
    val gameConfig by inject<GameConfig>()
    val messageHandler by inject<MessageHandler>()
    val disconnectAction by inject<GameDisconnectAction>()
    val requestConnection by inject<GameRequestConnectionAction>()
    val connectAction by inject<GameConnectAction>()
    route("game") {
        routeCreate(createGame, joinGame)
        routeJoin(joinGame)
        routeList(listGames)
        routeDelete(deleteGame)
        routeConfig(gameConfig)
        authenticate {
            routeWebsocketTicket()
        }
        routeWebsocket(messageHandler, disconnectAction, requestConnection, connectAction)
    }
}