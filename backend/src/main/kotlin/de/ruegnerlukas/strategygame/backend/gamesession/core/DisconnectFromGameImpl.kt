package de.ruegnerlukas.strategygame.backend.gamesession.core

import de.ruegnerlukas.strategygame.backend.common.logging.Logging
import de.ruegnerlukas.strategygame.backend.common.monitoring.MetricId
import de.ruegnerlukas.strategygame.backend.gamesession.ports.models.Game
import de.ruegnerlukas.strategygame.backend.common.monitoring.Monitoring.time
import de.ruegnerlukas.strategygame.backend.gamesession.ports.required.GamesByUserQuery
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.DisconnectFromGame
import de.ruegnerlukas.strategygame.backend.gamesession.ports.required.GameUpdate
import io.github.smiley4.ktorwebsocketsextended.session.WebSocketConnectionHandler
import io.ktor.websocket.*

class DisconnectFromGameImpl(
    private val gamesByUserQuery: GamesByUserQuery,
    private val gameUpdate: GameUpdate,
    private val websocketConnectionHandler: WebSocketConnectionHandler
) : DisconnectFromGame, Logging {

    private val metricId = MetricId.action(DisconnectFromGame::class)

    override suspend fun perform(userId: String) {
        time(metricId) {
            log().info("Disconnect user $userId from all currently connected games")
            val games = findGames(userId)
            clearConnections(userId, games)
        }
    }


    /**
     * find all games of the player with the given userId is currently connected to
     */
    private suspend fun findGames(userId: String): List<Game> {
        return gamesByUserQuery.execute(userId)
            .filter { game -> game.players.findByUserId(userId)?.connectionId != null }
    }


    /**
     * Clear all connections of the given user
     */
    private suspend fun clearConnections(userId: String, games: Collection<Game>) {
        games.forEach { game ->
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

}