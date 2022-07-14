package de.ruegnerlukas.strategygame.backend.core.actions.game

import arrow.core.Either
import arrow.core.computations.either
import arrow.core.flatMap
import de.ruegnerlukas.strategygame.backend.ports.errors.AlreadyConnectedError
import de.ruegnerlukas.strategygame.backend.ports.errors.ApplicationError
import de.ruegnerlukas.strategygame.backend.ports.errors.EntityNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.errors.GameNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.errors.NotParticipantError
import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.PlayerEntity
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameRequestConnectionAction
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.game.GameQuery
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.player.PlayerQueryByUserAndGame
import de.ruegnerlukas.strategygame.backend.shared.Logging

class GameRequestConnectionActionImpl(
	private val queryGame: GameQuery,
	private val queryPlayer: PlayerQueryByUserAndGame
) : GameRequestConnectionAction, Logging {

	override suspend fun perform(userId: String, gameId: String): Either<ApplicationError, Unit> {
		log().info("Request to connect to game-lobby $gameId from user $userId")
		return either {
			val game = findGame(gameId).bind()
			validatePlayer(game, userId).bind()
		}
	}


	private suspend fun findGame(gameId: String): Either<ApplicationError, GameEntity> {
		return queryGame.execute(gameId)
			.mapLeft { e ->
				when (e) {
					is EntityNotFoundError -> GameNotFoundError
					else -> e
				}
			}
	}


	private suspend fun validatePlayer(game: GameEntity, userId: String): Either<ApplicationError, Unit> {
		return queryPlayer.execute(userId, game.id)
			.mapLeft { e ->
				when (e) {
					is EntityNotFoundError -> NotParticipantError
					else -> e
				}
			}
			.flatMap { player: PlayerEntity ->
				if (player.connectionId == null) {
					Either.Right("").void()
				} else {
					Either.Left(AlreadyConnectedError)
				}
			}
	}

}