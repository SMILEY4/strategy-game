package io.github.smiley4.strategygame.backend.worlds.module.core

import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.common.monitoring.MetricId
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring.time
import io.github.smiley4.strategygame.backend.commonarangodb.EntityNotFoundError
import io.github.smiley4.strategygame.backend.commondata.Game
import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.commondata.PlayerState
import io.github.smiley4.strategygame.backend.engine.edge.GameStep
import io.github.smiley4.strategygame.backend.playerpov.edge.PlayerViewCreator
import io.github.smiley4.strategygame.backend.worlds.edge.GameMessageProducer
import io.github.smiley4.strategygame.backend.worlds.edge.TurnEnd
import io.github.smiley4.strategygame.backend.worlds.module.persistence.CommandsByGameQuery
import io.github.smiley4.strategygame.backend.worlds.module.persistence.GameExtendedQuery
import io.github.smiley4.strategygame.backend.worlds.module.persistence.GameExtendedUpdate
import io.github.smiley4.strategygame.backend.worlds.module.persistence.GameQuery
import io.github.smiley4.strategygame.backend.worlds.module.persistence.GameUpdate

internal class TurnEndImpl(
    private val commandsByGameQuery: CommandsByGameQuery,
    private val queryGameExtended: GameExtendedQuery,
    private val updateGameExtended: GameExtendedUpdate,
    private val queryGame: GameQuery,
    private val updateGame: GameUpdate,
    private val gameStepAction: GameStep,
    private val playerViewCreator: PlayerViewCreator,
    private val producer: GameMessageProducer
) : TurnEnd, Logging {

    private val metricId = MetricId.action(TurnEnd::class)

    override suspend fun perform(gameId: String) {
        return time(metricId) {
            log().info("End turn of game $gameId")
            val game = getGame(gameId)
            val gameExtended = getGameExtended(gameId)
            stepGame(gameExtended)
            updateGameInfo(game)
            sendPoVGameState(game, gameExtended)
        }
    }


    /**
     * @return the game or throw
     */
    private suspend fun getGame(gameId: String): Game {
        try {
            return queryGame.execute(gameId)
        } catch (e: EntityNotFoundError) {
            throw TurnEnd.GameNotFoundError(e)
        }
    }


    /**
     * @return the complete game state or throw
     */
    private suspend fun getGameExtended(gameId: String): GameExtended {
        try {
            return queryGameExtended.execute(gameId)
        } catch (e: EntityNotFoundError) {
            throw TurnEnd.GameNotFoundError(e)
        }
    }


    /**
     * update the game and world
     */
    private suspend fun stepGame(game: GameExtended) {
        val commands = commandsByGameQuery.execute(game.meta.gameId, game.meta.turn)
        try {
            gameStepAction.perform(game, commands)
        } catch (e: GameStep.GameStepError) {
            throw TurnEnd.GameStepError(e)
        }
        updateGameExtended.execute(game)
    }


    /**
     * Update the state of the game to prepare it for the next turn
     */
    private suspend fun updateGameInfo(game: Game) {
        game.players.forEach { player ->
            player.state = PlayerState.PLAYING
        }
        updateGame.execute(game)
    }


    /**
     * Send the new game-state to the connected players
     */
    private suspend fun sendPoVGameState(game: Game, gameExtended: GameExtended) {
        game.players
            .filter { it.connectionId != null }
            .map { it.userId }
            .forEach { sendPoVGameState(it, game, gameExtended) }
    }


    /**
     * Send the new game-state to the given player
     */
    private suspend fun sendPoVGameState(userId: String, game: Game, gameExtended: GameExtended) {
        val connectionId = game.players.findByUserId(userId)?.connectionId ?: throw Exception("Player is not connected")
        val playerView = playerViewCreator.build(userId, gameExtended)
        producer.sendGameState(connectionId, playerView)
    }

}