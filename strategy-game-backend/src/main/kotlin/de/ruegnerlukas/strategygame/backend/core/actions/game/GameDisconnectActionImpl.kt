package de.ruegnerlukas.strategygame.backend.core.actions.game

import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameEntity
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameDisconnectAction
import de.ruegnerlukas.strategygame.backend.ports.required.Monitoring
import de.ruegnerlukas.strategygame.backend.ports.required.MonitoringService.Companion.metricCoreAction
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.GameUpdate
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.GamesByUserQuery
import de.ruegnerlukas.strategygame.backend.shared.Logging

class GameDisconnectActionImpl(
    private val gamesByUserQuery: GamesByUserQuery,
    private val gameUpdate: GameUpdate
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
    private suspend fun findGames(userId: String): List<GameEntity> {
        return gamesByUserQuery.execute(userId)
    }

    /**
     * Set all connections of the given user to "null"
     */
    private suspend fun clearConnections(userId: String, games: List<GameEntity>) {
        games
            .filter { game -> game.players.find { it.userId == userId }?.connectionId != null }
            .forEach { game ->
                game.players.find { it.userId == userId }?.connectionId = null
                gameUpdate.execute(game)
            }
    }

}