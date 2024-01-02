package de.ruegnerlukas.strategygame.backend.gamesession.core

import arrow.core.Either
import arrow.core.continuations.either
import de.ruegnerlukas.strategygame.backend.common.jsondsl.JsonType
import de.ruegnerlukas.strategygame.backend.common.logging.Logging
import de.ruegnerlukas.strategygame.backend.common.monitoring.MetricId
import de.ruegnerlukas.strategygame.backend.common.monitoring.Monitoring.time
import de.ruegnerlukas.strategygame.backend.common.utils.getOrThrow
import de.ruegnerlukas.strategygame.backend.gameengine.ports.provided.GameStep
import de.ruegnerlukas.strategygame.backend.gamesession.external.message.models.GameStateMessage
import de.ruegnerlukas.strategygame.backend.gamesession.external.message.models.GameStateMessage.Companion.GameStatePayload
import de.ruegnerlukas.strategygame.backend.gamesession.external.message.websocket.MessageProducer
import de.ruegnerlukas.strategygame.backend.gamesession.ports.models.Game
import de.ruegnerlukas.strategygame.backend.gamesession.ports.models.PlayerState
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.TurnEnd
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.TurnEnd.GameNotFoundError
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.TurnEnd.TurnEndError
import de.ruegnerlukas.strategygame.backend.gamesession.ports.required.CommandsByGameQuery
import de.ruegnerlukas.strategygame.backend.gamesession.ports.required.GameQuery
import de.ruegnerlukas.strategygame.backend.gamesession.ports.required.GameUpdate

class TurnEndImpl(
    private val commandsByGameQuery: CommandsByGameQuery,
    private val queryGame: GameQuery,
    private val updateGame: GameUpdate,
    private val gameStepAction: GameStep,
    private val producer: MessageProducer
) : TurnEnd, Logging {

    private val metricId = MetricId.action(TurnEnd::class)

    override suspend fun perform(gameId: String): Either<TurnEndError, Unit> {
        return time(metricId) {
            log().info("End turn of game $gameId")
            either {
                val game = findGame(gameId).bind()
                val playerViews = stepGame(game)
                updateGameInfo(game)
                saveGame(game)
                sendGameStateMessages(game, playerViews)
            }
        }
    }


    /**
     * Find and return the [Game] or [GameNotFoundError] if the game does not exist
     */
    private suspend fun findGame(gameId: String): Either<GameNotFoundError, Game> {
        return queryGame.execute(gameId).mapLeft { GameNotFoundError }
    }


    /**
     * update the game and world
     */
    private suspend fun stepGame(game: Game): Map<String, JsonType> {
        val commands = commandsByGameQuery.execute(game.gameId, game.turn)
        return gameStepAction.perform(game.gameId, commands, getConnectedUsers(game)).getOrThrow()
    }


    /**
     * get all userIds of currently connected players of the given game
     */
    private fun getConnectedUsers(game: Game): List<String> {
        return game.players
            .filter { it.connectionId != null }
            .map { it.userId }
    }


    /**
     * Update the state of the game to prepare it for the next turn
     */
    private fun updateGameInfo(game: Game) {
        game.turn = game.turn + 1
        game.players.forEach { player ->
            player.state = PlayerState.PLAYING
        }
    }


    /**
     * Persists the given game
     */
    private suspend fun saveGame(game: Game) {
        updateGame.execute(game)
    }


    /**
     * Send the new game-state to the connected players
     */
    private suspend fun sendGameStateMessages(game: Game, playerViews: Map<String, JsonType>) {
        playerViews.forEach { (userId, view) ->
            val connectionId = getConnectionId(game, userId)
            producer.sendToSingle(connectionId, GameStateMessage(GameStatePayload(view)))
        }
    }


    /**
     * get connection id of player or null
     */
    private fun getConnectionId(game: Game, userId: String): Long {
        return game.players.findByUserId(userId)?.connectionId ?: throw Exception("Player is not connected")
    }

}