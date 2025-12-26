package io.github.smiley4.strategygame.backend.sessions.turnend

import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.common.monitoring.MetricId
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring.time
import io.github.smiley4.strategygame.backend.commonarangodb.EntityNotFoundError
import io.github.smiley4.strategygame.backend.commondata.Game
import io.github.smiley4.strategygame.backend.commondata.GameState
import io.github.smiley4.strategygame.backend.commondata.Player
import io.github.smiley4.strategygame.backend.engine.ports.provided.GameStep
import io.github.smiley4.strategygame.backend.playerpov.lib.PlayerViewCreator
import io.github.smiley4.strategygame.backend.sessions.events.GameEventProducer

internal class GameTurnEnd(
    private val gameDbCommandsQuery: GameDbCommandsQuery,
    private val gameDbQuery: GameDbQuery,
    private val gameDbStateQuery: GameDbStateQuery,
    private val gameDbStateUpdate: GameDbStateUpdate,
    private val gameDbUpdate: GameDbUpdate,
    private val gameStepAction: GameStep,
    private val playerViewCreator: PlayerViewCreator,
    private val producer: GameEventProducer
) : Logging {

    private val metricId = MetricId.action(GameTurnEnd::class)

    suspend fun end(gameId: Game.Id) {
        return time(metricId) {
            log().info("End turn of game $gameId")
            val game = getGame(gameId)
            val gameExtended = getGameState(gameId)
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
            return gameDbQuery.query(gameId)
        } catch (e: EntityNotFoundError) {
            throw GameTurnEndError.GameNotFoundError(e)
        }
    }


    /**
     * @return the complete game state or throw
     */
    private suspend fun getGameState(gameId: Game.Id): GameState {
        try {
            return gameDbStateQuery.query(gameId)
        } catch (e: EntityNotFoundError) {
            throw GameTurnEndError.GameNotFoundError(e)
        }
    }


    /**
     * update the game and world
     */
    private suspend fun stepGame(gameState: GameState) {
        val commands = gameDbCommandsQuery.query(gameState.game.id, gameState.game.turn)
        gameStepAction.perform(gameState, commands)
        gameDbStateUpdate.update(gameState)
    }


    /**
     * Update the state of the game to prepare it for the next turn
     */
    private suspend fun updateGameInfo(game: Game, gameState: GameState) {
        game.players.forEach { player ->
            player.state = Player.State.PLAYING
        }
        game.turn = gameState.game.turn
        gameDbUpdate.update(game)
    }


    /**
     * Send the new game-state to the connected players
     */
    private suspend fun sendPoVGameState(game: Game, gameState: GameState) {
        producer.sendGameState(game.id) { userId ->
            playerViewCreator.build(userId, gameState)
        }
    }

}