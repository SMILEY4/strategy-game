package de.ruegnerlukas.strategygame.backend.core.actions.game

import arrow.core.Either
import arrow.core.computations.either
import arrow.core.flatMap
import arrow.core.left
import arrow.core.right
import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameEntity
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameRequestConnectionAction
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameRequestConnectionAction.AlreadyConnectedError
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameRequestConnectionAction.GameNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameRequestConnectionAction.GameRequestConnectionActionError
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameRequestConnectionAction.NotParticipantError
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.game.GameQuery
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.player.PlayerQueryByUserAndGame
import de.ruegnerlukas.strategygame.backend.shared.Logging

class GameRequestConnectionActionImpl(
	private val queryGame: GameQuery,
	private val queryPlayer: PlayerQueryByUserAndGame
) : GameRequestConnectionAction, Logging {

	override suspend fun perform(userId: String, gameId: String): Either<GameRequestConnectionActionError, Unit> {
		log().info("Request to connect to game-lobby $gameId from user $userId")
		return either {
			val game = findGame(gameId).bind()
			validatePlayer(game, userId).bind()
		}
	}

	private suspend fun findGame(gameId: String): Either<GameNotFoundError, GameEntity> {
		return queryGame.execute(gameId).mapLeft { GameNotFoundError }
	}

	private suspend fun validatePlayer(game: GameEntity, userId: String): Either<GameRequestConnectionActionError, Unit> {
		return queryPlayer.execute(userId, game.id)
			.mapLeft { NotParticipantError }
			.flatMap { player ->
				if (player.connectionId == null) {
					Unit.right()
				} else {
					AlreadyConnectedError.left()
				}
			}
	}

}