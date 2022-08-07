package de.ruegnerlukas.strategygame.backend.core.actions.game

import arrow.core.Either
import arrow.core.continuations.either
import arrow.core.left
import arrow.core.right
import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameEntity
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameRequestConnectionAction
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameRequestConnectionAction.AlreadyConnectedError
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameRequestConnectionAction.GameNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameRequestConnectionAction.GameRequestConnectionActionError
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameRequestConnectionAction.NotParticipantError
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.GameQuery
import de.ruegnerlukas.strategygame.backend.shared.Logging

class GameRequestConnectionActionImpl(
	private val gameQuery: GameQuery,
) : GameRequestConnectionAction, Logging {

	override suspend fun perform(userId: String, gameId: String): Either<GameRequestConnectionActionError, Unit> {
		log().info("Requesting to connect to game $gameId as user $userId")
		return either {
			val game = findGame(gameId).bind()
			validatePlayer(game, userId).bind()
		}
	}


	/**
	 * Find and return the game or an [GameNotFoundError] if the game does not exist
	 */
	private suspend fun findGame(gameId: String): Either<GameNotFoundError, GameEntity> {
		return gameQuery.execute(gameId).mapLeft { GameNotFoundError }
	}


	/**
	 * Validate whether the given user can connect to the given game. Return nothing or an [GameRequestConnectionActionError]
	 */
	private fun validatePlayer(game: GameEntity, userId: String): Either<GameRequestConnectionActionError, Unit> {
		val player = game.players.find { it.userId == userId }
		if (player != null) {
			if (player.connectionId == null) {
				return Unit.right()
			} else {
				return AlreadyConnectedError.left()
			}
		} else {
			return NotParticipantError.left()
		}
	}

}