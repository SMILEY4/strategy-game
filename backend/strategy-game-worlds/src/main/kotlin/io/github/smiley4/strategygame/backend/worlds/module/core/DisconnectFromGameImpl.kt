package io.github.smiley4.strategygame.backend.worlds.module.core

import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.common.monitoring.MetricId
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring.time
import io.github.smiley4.strategygame.backend.commondata.Game
import io.github.smiley4.strategygame.backend.worlds.edge.DisconnectFromGame
import io.github.smiley4.strategygame.backend.worlds.module.persistence.GameUpdate
import io.github.smiley4.strategygame.backend.worlds.module.persistence.GamesByUserQuery
import io.ktor.websocket.*

internal class DisconnectFromGameImpl(
    private val gamesByUserQuery: GamesByUserQuery,
    private val gameUpdate: GameUpdate,
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
                player.connectionId = null
            }
            gameUpdate.execute(game)
        }
    }

}