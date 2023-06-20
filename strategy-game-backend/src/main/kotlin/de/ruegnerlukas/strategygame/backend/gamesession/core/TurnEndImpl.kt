package de.ruegnerlukas.strategygame.backend.gamesession.core

import arrow.core.Either
import arrow.core.continuations.either
import arrow.core.getOrElse
import de.ruegnerlukas.strategygame.backend.common.logging.Logging
import de.ruegnerlukas.strategygame.backend.common.models.GameExtended
import de.ruegnerlukas.strategygame.backend.common.models.Player
import de.ruegnerlukas.strategygame.backend.common.monitoring.Monitoring
import de.ruegnerlukas.strategygame.backend.common.monitoring.MonitoringService.Companion.metricCoreAction
import de.ruegnerlukas.strategygame.backend.gameengine.ports.provided.GameStepAction
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.SendGameStateAction
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.TurnEnd
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.TurnEnd.GameNotFoundError
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.TurnEnd.TurnEndActionError
import de.ruegnerlukas.strategygame.backend.gamesession.ports.required.CommandsByGameQuery
import de.ruegnerlukas.strategygame.backend.gamesession.ports.required.GameExtendedQuery
import de.ruegnerlukas.strategygame.backend.gamesession.ports.required.GameExtendedUpdate

class TurnEndImpl(
    private val actionSendGameState: SendGameStateAction,
    private val gameExtendedQuery: GameExtendedQuery,
    private val gameExtendedUpdate: GameExtendedUpdate,
    private val commandsByGameQuery: CommandsByGameQuery,
    private val gameStepAction: GameStepAction
) : TurnEnd, Logging {

    private val metricId = metricCoreAction(TurnEnd::class)

    override suspend fun perform(gameId: String): Either<TurnEndActionError, Unit> {
        return Monitoring.coTime(metricId) {
            log().info("End turn of game $gameId")
            either {
                val game = findGameState(gameId).bind()
                stepGame(game)
                updateGameInfo(game)
                saveGameState(game)
                sendGameStateMessages(game)
            }
        }
    }


    /**
     * Find and return the [GameExtended] or [GameNotFoundError] if the game does not exist
     */
    private suspend fun findGameState(gameId: String): Either<GameNotFoundError, GameExtended> {
        return gameExtendedQuery.execute(gameId).mapLeft { GameNotFoundError }
    }


    /**
     * update the game and world
     */
    private suspend fun stepGame(game: GameExtended) {
        val commands = commandsByGameQuery.execute(game.game.gameId, game.game.turn)
        gameStepAction.perform(game, commands)
        // todo: handle errors -> [CommandResolutionFailedError]
    }


    /**
     * Update the state of the game to prepare it for the next turn
     */
    private fun updateGameInfo(game: GameExtended) {
        game.game.turn = game.game.turn + 1
        game.game.players.forEach { player ->
            player.state = Player.STATE_PLAYING
        }
    }


    /**
     * Update the game state in the database
     */
    private suspend fun saveGameState(game: GameExtended) {
        gameExtendedUpdate.execute(game)
    }


    /**
     * Send the new game-state to the connected players
     */
    private suspend fun sendGameStateMessages(game: GameExtended) {
        game.game.players
            .filter { it.connectionId != null }
            .forEach {
                actionSendGameState.perform(game, it.userId)
                    .getOrElse { throw Exception("Could not send state of game ${game.game.gameId} to player ${it.userId}") }
            }
    }

}