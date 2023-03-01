package de.ruegnerlukas.strategygame.backend.core.actions.turn

import arrow.core.Either
import arrow.core.continuations.either
import arrow.core.getOrElse
import de.ruegnerlukas.strategygame.backend.core.actions.events.GameEventManager
import de.ruegnerlukas.strategygame.backend.core.actions.events.events.GameEventWorldPostUpdate
import de.ruegnerlukas.strategygame.backend.core.actions.events.events.GameEventWorldPrepare
import de.ruegnerlukas.strategygame.backend.core.actions.events.events.GameEventWorldUpdate
import de.ruegnerlukas.strategygame.backend.ports.models.CommandResolutionError
import de.ruegnerlukas.strategygame.backend.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.ports.models.Player
import de.ruegnerlukas.strategygame.backend.ports.provided.commands.ResolveCommandsAction
import de.ruegnerlukas.strategygame.backend.ports.provided.sendstate.SendGameStateAction
import de.ruegnerlukas.strategygame.backend.ports.provided.turn.TurnEndAction
import de.ruegnerlukas.strategygame.backend.ports.provided.turn.TurnEndAction.CommandResolutionFailedError
import de.ruegnerlukas.strategygame.backend.ports.provided.turn.TurnEndAction.GameNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.provided.turn.TurnEndAction.TurnEndActionError
import de.ruegnerlukas.strategygame.backend.ports.required.Monitoring
import de.ruegnerlukas.strategygame.backend.ports.required.MonitoringService.Companion.metricCoreAction
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.CommandsByGameQuery
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.GameExtendedQuery
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.GameExtendedUpdate
import de.ruegnerlukas.strategygame.backend.shared.Logging

class TurnEndActionImpl(
    private val actionResolveCommands: ResolveCommandsAction,
    private val actionSendGameState: SendGameStateAction,
    private val gameExtendedQuery: GameExtendedQuery,
    private val gameExtendedUpdate: GameExtendedUpdate,
    private val commandsByGameQuery: CommandsByGameQuery,
    private val gameEventManager: GameEventManager
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
        gameEventManager.send(GameEventWorldPrepare::class.simpleName!!, GameEventWorldPrepare(game))
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
        gameEventManager.send(GameEventWorldUpdate::class.simpleName!!, GameEventWorldUpdate(game))
        gameEventManager.send(GameEventWorldPostUpdate::class.simpleName!!, GameEventWorldPostUpdate(game))
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