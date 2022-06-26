package de.ruegnerlukas.strategygame.backend.core.actions.game

import de.ruegnerlukas.strategygame.backend.ports.errors.AlreadyConnectedError
import de.ruegnerlukas.strategygame.backend.ports.errors.ApplicationError
import de.ruegnerlukas.strategygame.backend.ports.errors.EntityNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.errors.GameNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.errors.NotParticipantError
import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameEntity
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameRequestConnectionAction
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.game.GameQuery
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.player.PlayerQueryByUserAndGame
import de.ruegnerlukas.strategygame.backend.shared.Logging
import de.ruegnerlukas.strategygame.backend.shared.either.Either
import de.ruegnerlukas.strategygame.backend.shared.either.Err
import de.ruegnerlukas.strategygame.backend.shared.either.Ok
import de.ruegnerlukas.strategygame.backend.shared.either.flatMap
import de.ruegnerlukas.strategygame.backend.shared.either.mapError

class GameRequestConnectionActionImpl(
	private val queryGame: GameQuery,
	private val queryPlayer: PlayerQueryByUserAndGame
) : GameRequestConnectionAction, Logging {

	override suspend fun perform(userId: String, gameId: String): Either<Unit, ApplicationError> {
		log().info("Request to connect to game-lobby $gameId from user $userId")
		return Either.start()
			.flatMap { findGame(gameId) }
			.flatMap { validatePlayer(it, userId) }
	}


	private suspend fun findGame(gameId: String): Either<GameEntity, ApplicationError> {
		return queryGame.execute(gameId)
			.mapError(EntityNotFoundError) { GameNotFoundError }
	}


	private suspend fun validatePlayer(game: GameEntity, userId: String): Either<Unit, ApplicationError> {
		return Either.start()
			.flatMap { queryPlayer.execute(userId, game.id) }
			.mapError(EntityNotFoundError) { NotParticipantError }
			.flatMap { player -> if (player.connectionId == null) Ok() else Err(AlreadyConnectedError) }
	}

}