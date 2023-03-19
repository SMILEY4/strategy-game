package de.ruegnerlukas.strategygame.backend.core.actions.game

import de.ruegnerlukas.strategygame.backend.ports.models.Game
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameDisconnectAction
import de.ruegnerlukas.strategygame.backend.ports.required.monitoring.Monitoring
import de.ruegnerlukas.strategygame.backend.ports.required.monitoring.MonitoringService.Companion.metricCoreAction
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.GameUpdate
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.GamesByUserQuery
import de.ruegnerlukas.strategygame.backend.shared.Logging
import io.github.smiley4.ktorwebsocketsextended.session.WebSocketConnectionHandler
import io.ktor.websocket.CloseReason
import io.ktor.websocket.close
import kotlinx.coroutines.isActive

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