package de.ruegnerlukas.strategygame.backend.gamesession.core

import arrow.core.Either
import arrow.core.continuations.either
import arrow.core.getOrElse
import de.ruegnerlukas.strategygame.backend.commandresolution.ports.models.CommandResolutionError
import de.ruegnerlukas.strategygame.backend.commandresolution.ports.provided.ResolveCommandsAction
import de.ruegnerlukas.strategygame.backend.common.Logging
import de.ruegnerlukas.strategygame.backend.common.models.GameExtended
import de.ruegnerlukas.strategygame.backend.common.models.Player
import de.ruegnerlukas.strategygame.backend.common.monitoring.Monitoring
import de.ruegnerlukas.strategygame.backend.common.monitoring.MonitoringService.Companion.metricCoreAction
import de.ruegnerlukas.strategygame.backend.gameengine.ports.provided.TurnUpdateAction
import de.ruegnerlukas.strategygame.backend.gamesession.ports.required.CommandsByGameQuery
import de.ruegnerlukas.strategygame.backend.gamesession.ports.required.GameExtendedUpdate
import de.ruegnerlukas.strategygame.backend.gamesession.ports.SendGameStateAction
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.TurnEndAction
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.TurnEndAction.CommandResolutionFailedError
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.TurnEndAction.GameNotFoundError
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.TurnEndAction.TurnEndActionError
import de.ruegnerlukas.strategygame.backend.gamesession.ports.required.GameExtendedQuery

class TurnEndActionImpl(
    private val actionResolveCommands: ResolveCommandsAction,
    private val actionSendGameState: SendGameStateAction,
    private val gameExtendedQuery: GameExtendedQuery,
    private val gameExtendedUpdate: GameExtendedUpdate,
    private val commandsByGameQuery: CommandsByGameQuery,
    private val turnUpdate: TurnUpdateAction
) : TurnEndAction, Logging {

    private val metricId = metricCoreAction(TurnEndAction::class)

    override suspend fun perform(gameId: String): Either<TurnEndActionError, Unit> {
        return Monitoring.coTime(metricId) {
            log().info("End turn of game $gameId")
            either {
                val game = findGameState(gameId).bind()
                prepareGameWorld(game)
                resolveCommands(game).bind()
                updateGameWorld(game)
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
     * Prepare the game state (e.g. reset turn-based-values, ...)
     */
    private suspend fun prepareGameWorld(game: GameExtended) {
        turnUpdate.prepare(game)
    }


    /**
     * Resolve/Apply the commands of the (ended) turn
     */
    private suspend fun resolveCommands(game: GameExtended): Either<CommandResolutionFailedError, List<CommandResolutionError>> {
        val commands = commandsByGameQuery.execute(game.game.gameId, game.game.turn)
        return actionResolveCommands.perform(game, commands).mapLeft { CommandResolutionFailedError }
    }


    /**
     * Update the game state (e.g. player income/resources, timers, ...)
     */
    private suspend fun updateGameWorld(game: GameExtended) {
        turnUpdate.globalUpdate(game)
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