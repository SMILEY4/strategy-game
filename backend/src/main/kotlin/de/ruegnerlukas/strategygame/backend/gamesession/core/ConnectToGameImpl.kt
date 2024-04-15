package de.ruegnerlukas.strategygame.backend.gamesession.core

import de.ruegnerlukas.strategygame.backend.common.logging.Logging
import de.ruegnerlukas.strategygame.backend.common.monitoring.MetricId
import de.ruegnerlukas.strategygame.backend.common.monitoring.Monitoring.time
import de.ruegnerlukas.strategygame.backend.common.persistence.EntityNotFoundError
import de.ruegnerlukas.strategygame.backend.gameengine.ports.provided.POVBuilder
import de.ruegnerlukas.strategygame.backend.gamesession.external.message.models.GameStateMessage
import de.ruegnerlukas.strategygame.backend.gamesession.external.message.models.GameStateMessage.Companion.GameStatePayload
import de.ruegnerlukas.strategygame.backend.gamesession.external.message.websocket.MessageProducer
import de.ruegnerlukas.strategygame.backend.gamesession.ports.models.Game
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.ConnectToGame
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.ConnectToGame.GameNotFoundError
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.ConnectToGame.InvalidPlayerState
import de.ruegnerlukas.strategygame.backend.gamesession.ports.required.GameQuery
import de.ruegnerlukas.strategygame.backend.gamesession.ports.required.GameUpdate

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