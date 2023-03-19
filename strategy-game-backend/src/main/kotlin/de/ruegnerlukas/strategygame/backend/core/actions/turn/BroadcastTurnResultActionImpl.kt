package de.ruegnerlukas.strategygame.backend.core.actions.turn

import arrow.core.Either
import arrow.core.continuations.either
import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameExtendedEntity
import de.ruegnerlukas.strategygame.backend.ports.models.CommandResolutionError
import de.ruegnerlukas.strategygame.backend.ports.provided.turn.BroadcastTurnResultAction
import de.ruegnerlukas.strategygame.backend.ports.provided.turn.BroadcastTurnResultAction.GameNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.provided.turn.BroadcastTurnResultAction.WorldStateBroadcasterActionError
import de.ruegnerlukas.strategygame.backend.ports.required.GameMessageProducer
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.GameExtendedQuery
import de.ruegnerlukas.strategygame.backend.shared.Logging

class BroadcastTurnResultActionImpl(
	private val gameExtendedQuery: GameExtendedQuery,
	private val messageProducer: GameMessageProducer,
) : BroadcastTurnResultAction, Logging {

	override suspend fun perform(gameId: String, errors: List<CommandResolutionError>): Either<WorldStateBroadcasterActionError, Unit> {
		log().info("Sending world-state of game $gameId to connected player(s)")
		return either {
			val game = findGame(gameId).bind()
			val connectionIds = getConnectionIds(game)
			sendGameStateMessages(connectionIds, game, errors)
		}
	}


	/**
	 * Find and return the game or a [GameNotFoundError] if a game with that id does not exist
	 */
	private suspend fun findGame(gameId: String): Either<GameNotFoundError, GameExtendedEntity> {
		return gameExtendedQuery.execute(gameId).mapLeft { GameNotFoundError }
	}


	/**
	 * get connection ids of connected players
	 */
	private fun getConnectionIds(game: GameExtendedEntity): List<Int> {
		return game.game.players
			.filter { it.connectionId !== null }
			.map { it.connectionId!! }
	}


	/**
	 * Send the new game-state to the connected players
	 */
	private suspend fun sendGameStateMessages(connectionIds: List<Int>, game: GameExtendedEntity, errors: List<CommandResolutionError>) {
		connectionIds.forEach { connectionId ->
			messageProducer.sendTurnResult(connectionId, game, errors)
		}
	}

}