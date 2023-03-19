package de.ruegnerlukas.strategygame.backend.core.actions.turn

import arrow.core.Either
import arrow.core.continuations.either
import arrow.core.getOrElse
import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameExtendedEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.PlayerEntity
import de.ruegnerlukas.strategygame.backend.ports.models.CommandResolutionError
import de.ruegnerlukas.strategygame.backend.ports.provided.commands.ResolveCommandsAction
import de.ruegnerlukas.strategygame.backend.ports.provided.turn.BroadcastTurnResultAction
import de.ruegnerlukas.strategygame.backend.ports.provided.turn.TurnEndAction
import de.ruegnerlukas.strategygame.backend.ports.provided.turn.TurnEndAction.CommandResolutionFailedError
import de.ruegnerlukas.strategygame.backend.ports.provided.turn.TurnEndAction.GameNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.provided.turn.TurnEndAction.TurnEndActionError
import de.ruegnerlukas.strategygame.backend.ports.provided.turn.TurnUpdateAction
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.CommandsByGameQuery
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.GameExtendedQuery
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.GameExtendedUpdate
import de.ruegnerlukas.strategygame.backend.shared.Logging

class TurnEndActionImpl(
	private val actionResolveCommands: ResolveCommandsAction,
	private val actionBroadcastTurnResult: BroadcastTurnResultAction,
	private val actionUpdateTurn: TurnUpdateAction,
	private val gameExtendedQuery: GameExtendedQuery,
	private val gameExtendedUpdate: GameExtendedUpdate,
	private val commandsByGameQuery: CommandsByGameQuery,
) : TurnEndAction, Logging {

	override suspend fun perform(gameId: String): Either<TurnEndActionError, Unit> {
		log().info("End turn of game $gameId")
		return either {
			val game = findGameState(gameId).bind()
			val errors = resolveCommands(game).bind()
			updateGameWorld(game)
			updateGameInfo(game)
			saveGameState(game)
			sendGameStateMessages(game, errors)
		}
	}


	/**
	 * Find and return the [GameExtendedEntity] or [GameNotFoundError] if the game does not exist
	 */
	private suspend fun findGameState(gameId: String): Either<GameNotFoundError, GameExtendedEntity> {
		return gameExtendedQuery.execute(gameId).mapLeft { GameNotFoundError }
	}


	/**
	 * Update the game state (e.g. player income/resources, timers, ...)
	 */
	private fun updateGameWorld(game: GameExtendedEntity) {
		actionUpdateTurn.perform(game)
	}


	/**
	 * Update the state of the game to prepare it for the next turn
	 */
	private fun updateGameInfo(game: GameExtendedEntity) {
		game.game.turn = game.game.turn + 1
		game.game.players.forEach { player ->
			player.state = PlayerEntity.STATE_PLAYING
		}
	}


	/**
	 * Resolve/Apply the commands of the (ended) turn
	 */
	private suspend fun resolveCommands(game: GameExtendedEntity): Either<CommandResolutionFailedError, List<CommandResolutionError>> {
		val commands = commandsByGameQuery.execute(game.game.key!!, game.game.turn)
		return actionResolveCommands.perform(game, commands).mapLeft { CommandResolutionFailedError }
	}


	/**
	 * Update the game state in the database
	 */
	private suspend fun saveGameState(game: GameExtendedEntity) {
		gameExtendedUpdate.execute(game)
	}


	/**
	 * Send the new game-state to the connected players
	 */
	private suspend fun sendGameStateMessages(game: GameExtendedEntity, errors: List<CommandResolutionError>) {
		actionBroadcastTurnResult.perform(game.game.key!!, errors)
			.getOrElse { throw Exception("Could not find game when sending game-state-messages") }
	}

}