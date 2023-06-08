package de.ruegnerlukas.strategygame.backend.gamesession.core

import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.GameDisconnectAction
import de.ruegnerlukas.strategygame.backend.common.monitoring.Monitoring
import de.ruegnerlukas.strategygame.backend.common.monitoring.MonitoringService.Companion.metricCoreAction
import de.ruegnerlukas.strategygame.backend.gamesession.ports.required.GameUpdate
import de.ruegnerlukas.strategygame.backend.gameengine.ports.required.GamesByUserQuery
import de.ruegnerlukas.strategygame.backend.common.Logging
import de.ruegnerlukas.strategygame.backend.common.models.Game
import io.github.smiley4.ktorwebsocketsextended.session.WebSocketConnectionHandler
import io.ktor.websocket.close

class GameDisconnectActionImpl(
    private val gamesByUserQuery: GamesByUserQuery,
    private val gameUpdate: GameUpdate,
    private val websocketConnectionHandler: WebSocketConnectionHandler
) : GameDisconnectAction, Logging {

    private val metricId = metricCoreAction(GameDisconnectAction::class)

    override suspend fun perform(userId: String) {
        Monitoring.coTime(metricId) {
            log().info("Disconnect user $userId from all currently connected games")
            val games = findGames(userId)
            clearConnections(userId, games)
        }
    }


    /**
     * find all games of the current user
     */
    private suspend fun findGames(userId: String): List<Game> {
        return gamesByUserQuery.execute(userId)
    }


    /**
     * Set all connections of the given user to "null"
     */
    private suspend fun clearConnections(userId: String, games: List<Game>) {
        gamesWithConnectedUser(games, userId).forEach { game ->
            game.players.findByUserId(userId)?.also { player ->
                player.connectionId?.also { closeConnection(it) }
                player.connectionId = null
            }
            gameUpdate.execute(game)
        }
    }


    /**
     * Closes the websocket connection
     */
    private suspend fun closeConnection(connectionId: Long) {
        val connection = websocketConnectionHandler.getConnection(connectionId)
        connection?.getSession()?.close()
    }

    /**
     * Find all games the player with the given userId is currently connected to
     */
    private fun gamesWithConnectedUser(games: List<Game>, userId: String): List<Game> {
        return games.filter { game -> game.players.findByUserId(userId)?.connectionId != null }
    }

}