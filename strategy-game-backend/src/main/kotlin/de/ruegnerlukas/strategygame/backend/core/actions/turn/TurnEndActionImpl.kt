package de.ruegnerlukas.strategygame.backend.core.actions.turn

import arrow.core.Either
import arrow.core.continuations.either
import arrow.core.getOrElse
import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.PlayerEntity
import de.ruegnerlukas.strategygame.backend.ports.models.game.CommandResolutionError
import de.ruegnerlukas.strategygame.backend.ports.provided.commands.ResolveCommandsAction
import de.ruegnerlukas.strategygame.backend.ports.provided.turn.BroadcastTurnResultAction
import de.ruegnerlukas.strategygame.backend.ports.provided.turn.TurnEndAction
import de.ruegnerlukas.strategygame.backend.ports.provided.turn.TurnEndAction.CommandResolutionFailedError
import de.ruegnerlukas.strategygame.backend.ports.provided.turn.TurnEndAction.GameNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.provided.turn.TurnEndAction.TurnEndActionError
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.CommandsByGameQuery
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.GameQuery
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.GameUpdate
import de.ruegnerlukas.strategygame.backend.shared.Logging

class TurnEndActionImpl(
	private val actionResolveCommands: ResolveCommandsAction,
	private val actionBroadcastWorldState: BroadcastTurnResultAction,
	private val gameQuery: GameQuery,
	private val gameUpdate: GameUpdate,
	private val commandsByGameQuery: CommandsByGameQuery,
) : TurnEndAction, Logging {

	override suspend fun perform(gameId: String): Either<TurnEndActionError, Unit> {
		log().info("End turn of game $gameId")
		return either {
			val game = findGame(gameId).bind()
			val errors = resolveCommands(game).bind()
			updateGame(game)
			sendGameStateMessages(game, errors)
		}
	}


	/**
	 * Find and return the game or a [GameNotFoundError] if a game with that id does not exist
	 */
	private suspend fun findGame(gameId: String): Either<GameNotFoundError, GameEntity> {
		return gameQuery.execute(gameId).mapLeft { GameNotFoundError }
	}


	/**
	 * Update the state of the game to prepare it for the next turn
	 */
	private suspend fun updateGame(game: GameEntity) {
		game.turn = game.turn + 1
		game.players.forEach { player ->
			player.state = PlayerEntity.STATE_PLAYING
		}
		gameUpdate.execute(game)
	}


	/**
	 * Resolve/Apply the commands of the (ended) turn
	 */
	private suspend fun resolveCommands(game: GameEntity): Either<CommandResolutionFailedError, List<CommandResolutionError>> {
		val commands = commandsByGameQuery.execute(game.id!!, game.turn)
		return actionResolveCommands.perform(game.id, commands).mapLeft { CommandResolutionFailedError }
	}


	/**
	 * Send the new game-state to the connected players
	 */
	private suspend fun sendGameStateMessages(game: GameEntity, errors: List<CommandResolutionError>) {
		actionBroadcastWorldState.perform(game.id!!, errors)
			.getOrElse { throw Exception("Could not find game when sending game-state-messages") }
	}

}