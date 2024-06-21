package io.github.smiley4.strategygame.backend.worlds.module.core

import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.common.monitoring.MetricId
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring.time
import io.github.smiley4.strategygame.backend.common.persistence.EntityNotFoundError
import io.github.smiley4.strategygame.backend.engine.ports.provided.POVBuilder
import io.github.smiley4.strategygame.backend.worlds.external.message.models.GameStateMessage
import io.github.smiley4.strategygame.backend.worlds.external.message.models.GameStateMessage.Companion.GameStatePayload
import io.github.smiley4.strategygame.backend.worlds.external.message.websocket.MessageProducer
import io.github.smiley4.strategygame.backend.common.models.Game
import io.github.smiley4.strategygame.backend.worlds.ports.provided.ConnectToGame
import io.github.smiley4.strategygame.backend.worlds.ports.provided.ConnectToGame.GameNotFoundError
import io.github.smiley4.strategygame.backend.worlds.ports.provided.ConnectToGame.InvalidPlayerState
import io.github.smiley4.strategygame.backend.worlds.module.core.required.GameQuery
import io.github.smiley4.strategygame.backend.worlds.module.core.required.GameUpdate


class ConnectToGameImpl(
    private val gameQuery: GameQuery,
    private val gameUpdate: GameUpdate,
    private val playerViewCreator: POVBuilder,
    private val producer: MessageProducer
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
     * Find and return the game or an [GameNotFoundError] if the game does not exist
     */
    private suspend fun findGame(gameId: String): Game {
        try {
            return gameQuery.execute(gameId)
        } catch (e: EntityNotFoundError) {
            throw GameNotFoundError()
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
            throw InvalidPlayerState()
        }
    }


    /**
     * Send the initial game-state to the connected player
     * */
    private suspend fun sendInitialGameStateMessage(gameId: String, userId: String, connectionId: Long) {
        val view = playerViewCreator.build(userId, gameId)
        producer.sendToSingle(connectionId, GameStateMessage(GameStatePayload(view)))
    }

}