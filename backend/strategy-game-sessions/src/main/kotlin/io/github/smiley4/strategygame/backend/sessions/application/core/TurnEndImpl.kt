package io.github.smiley4.strategygame.backend.sessions.application.core

import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.common.monitoring.MetricId
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring.time
import io.github.smiley4.strategygame.backend.commonarangodb.EntityNotFoundError
import io.github.smiley4.strategygame.backend.commondata.Game
import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.commondata.PlayerState
import io.github.smiley4.strategygame.backend.commondata.User
import io.github.smiley4.strategygame.backend.playerpov.lib.PlayerViewCreator
import io.github.smiley4.strategygame.backend.sessions.application.persistence.CommandsByGameQuery
import io.github.smiley4.strategygame.backend.sessions.application.persistence.GameExtendedQuery
import io.github.smiley4.strategygame.backend.sessions.application.persistence.GameQuery
import io.github.smiley4.strategygame.backend.sessions.application.persistence.GameUpdate
import io.github.smiley4.strategygame.backend.sessions.ports.provided.GameMessageProducer
import io.github.smiley4.strategygame.backend.sessions.ports.provided.TurnEnd
import io.github.smiley4.strategygame.backend.sessions.ports.required.GameStep

internal class TurnEndImpl(
    private val commandsByGameQuery: CommandsByGameQuery,
    private val queryGameExtended: GameExtendedQuery,
    private val updateGameExtended: io.github.smiley4.strategygame.backend.sessions.application.persistence.GameExtendedUpdate,
    private val queryGame: GameQuery,
    private val updateGame: GameUpdate,
    private val gameStepAction: GameStep,
    private val playerViewCreator: PlayerViewCreator,
    private val producer: GameMessageProducer
) : TurnEnd, Logging {

    private val metricId = MetricId.action(TurnEnd::class)

    override suspend fun perform(gameId: Game.Id) {
        return time(metricId) {
            log().info("End turn of game $gameId")
            val game = getGame(gameId)
            val gameExtended = getGameExtended(gameId)
            stepGame(gameExtended)
            updateGameInfo(game, gameExtended)
            sendPoVGameState(game, gameExtended)
        }
    }


    /**
     * @return the game or throw
     */
    private suspend fun getGame(gameId: Game.Id): Game {
        try {
            return queryGame.execute(gameId)
        } catch (e: EntityNotFoundError) {
            throw TurnEnd.GameNotFoundError(e)
        }
    }


    /**
     * @return the complete game state or throw
     */
    private suspend fun getGameExtended(gameId: Game.Id): GameExtended {
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
        val commands = commandsByGameQuery.execute(game.meta.id, game.meta.turn)
        gameStepAction.perform(game, commands)
        updateGameExtended.execute(game)
    }


    /**
     * Update the state of the game to prepare it for the next turn
     */
    private suspend fun updateGameInfo(game: Game, gameExtended: GameExtended) {
        game.players.forEach { player ->
            player.state = PlayerState.PLAYING
        }
        game.turn = gameExtended.meta.turn
        updateGame.execute(game)
    }


    /**
     * Send the new game-state to the connected players
     */
    private suspend fun sendPoVGameState(game: Game, gameExtended: GameExtended) {
        game.players
            .filter { it.connectionId != null }
            .map { it.user }
            .forEach { sendPoVGameState(it, game, gameExtended) }
    }


    /**
     * Send the new game-state to the given player
     */
    private suspend fun sendPoVGameState(userId: User.Id, game: Game, gameExtended: GameExtended) {
        val connectionId = game.players.findByUserId(userId)?.connectionId ?: throw Exception("Player is not connected")
        val playerView = playerViewCreator.build(userId, gameExtended)
        producer.sendGameState(connectionId, playerView)
    }

}