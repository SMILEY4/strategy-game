package io.github.smiley4.strategygame.backend.worlds.module.core

import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.common.monitoring.MetricId
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring.time
import io.github.smiley4.strategygame.backend.commonarangodb.EntityNotFoundError
import io.github.smiley4.strategygame.backend.commondata.Game
import io.github.smiley4.strategygame.backend.playerpov.edge.PlayerViewCreator
import io.github.smiley4.strategygame.backend.worlds.edge.ConnectToGame
import io.github.smiley4.strategygame.backend.worlds.edge.GameMessageProducer
import io.github.smiley4.strategygame.backend.worlds.module.persistence.GameQuery
import io.github.smiley4.strategygame.backend.worlds.module.persistence.GameUpdate


internal class ConnectToGameImpl(
    private val gameQuery: GameQuery,
    private val gameUpdate: GameUpdate,
    private val playerViewCreator: PlayerViewCreator,
    private val producer: GameMessageProducer
) : ConnectToGame, Logging {

    private val metricId = MetricId.action(ConnectToGame::class)


    override suspend fun perform(userId: String, gameId: String, connectionId: Long) {
        return time(metricId) {
            log().info("Connect user $userId ($connectionId) to game $gameId")
            val game = findGame(gameId)
            updateConnection(game, userId, connectionId)
            sendInitialGameStateMessage(gameId, userId, connectionId)
        }
    }


    /**
     * Find and return the game or throw if the game does not exist
     */
    private suspend fun findGame(gameId: String): Game {
        try {
            return gameQuery.execute(gameId)
        } catch (e: EntityNotFoundError) {
            throw ConnectToGame.GameNotFoundError()
        }
    }


    /**
     * Persist the (new) connection of the player.
     */
    private suspend fun updateConnection(game: Game, userId: String, connectionId: Long) {
        val player = game.players.findByUserId(userId)
        if (player != null && player.connectionId == null) {
            player.connectionId = connectionId
            gameUpdate.execute(game)
        } else {
            throw ConnectToGame.InvalidPlayerState()
        }
    }


    /**
     * Send the initial game-state to the connected player
     * */
    private suspend fun sendInitialGameStateMessage(gameId: String, userId: String, connectionId: Long) {
        val view = playerViewCreator.build(userId, gameId)
        producer.sendGameState(connectionId, view)
    }

}