package de.ruegnerlukas.strategygame.backend.gamesession.external.api

import de.ruegnerlukas.strategygame.backend.common.GameConfig
import de.ruegnerlukas.strategygame.backend.gameengine.external.message.handler.MessageHandler
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.GameConnectAction
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.GameCreateAction
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.GameDeleteAction
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.GameDisconnectAction
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.GameJoinAction
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.GameRequestConnectionAction
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.GamesListAction
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
        authenticate("user") {
            routeCreate(createGame, joinGame)
            routeJoin(joinGame)
            routeList(listGames)
            routeDelete(deleteGame)
            routeConfig(gameConfig)
            routeWebsocketTicket()
        }
        routeWebsocket(messageHandler, disconnectAction, requestConnection, connectAction)
    }
}