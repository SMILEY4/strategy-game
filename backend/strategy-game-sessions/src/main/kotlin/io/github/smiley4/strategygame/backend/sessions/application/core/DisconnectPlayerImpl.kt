package io.github.smiley4.strategygame.backend.sessions.application.core

import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.common.monitoring.MetricId
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring.time
import io.github.smiley4.strategygame.backend.commondata.Game
import io.github.smiley4.strategygame.backend.commondata.User
import io.github.smiley4.strategygame.backend.sessions.application.persistence.GameUpdate
import io.github.smiley4.strategygame.backend.sessions.application.persistence.GamesByUserQuery
import io.github.smiley4.strategygame.backend.sessions.ports.provided.DisconnectPlayer

internal class DisconnectPlayerImpl(
    private val gamesByUserQuery: GamesByUserQuery,
    private val gameUpdate: GameUpdate,
) : DisconnectPlayer, Logging {

    private val metricId = MetricId.action(DisconnectPlayer::class)

    override suspend fun perform(user: User.Id) {
        time(metricId) {
            log().info("Disconnect user $user from all currently connected games")
            val games = findGames(user)
            clearConnections(user, games)
        }
    }


    /**
     * find all games of the player with the given userId is currently connected to
     */
    private suspend fun findGames(userId: User.Id): List<Game> {
        return gamesByUserQuery.execute(userId)
            .filter { game -> game.players.findByUserId(userId)?.connectionId != null }
    }


    /**
     * Clear all connections of the given user
     */
    private suspend fun clearConnections(userId: User.Id, games: Collection<Game>) {
        games.forEach { game ->
            game.players.findByUserId(userId)?.also { player ->
                player.connectionId = null
            }
            gameUpdate.execute(game)
        }
    }

}