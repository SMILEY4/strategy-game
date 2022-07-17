package de.ruegnerlukas.strategygame.backend.core.actions.game

import arrow.core.Either
import arrow.core.computations.either
import arrow.core.getOrElse
import arrow.core.left
import arrow.core.right
import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.PlayerEntity
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameJoinAction
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameJoinAction.GameJoinActionErrors
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameJoinAction.GameNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameJoinAction.UserAlreadyPlayer
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.EntityNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.game.GameQuery
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.player.PlayerInsert
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.player.PlayerQueryByUserAndGame
import de.ruegnerlukas.strategygame.backend.shared.Logging
import de.ruegnerlukas.strategygame.backend.shared.UUID

class GameJoinActionImpl(
	private val queryGame: GameQuery,
	private val insertPlayer: PlayerInsert,
	private val queryPlayer: PlayerQueryByUserAndGame
) : GameJoinAction, Logging {

	override suspend fun perform(userId: String, gameId: String): Either<GameJoinActionErrors, Unit> {
		log().info("Joining game $gameId as user $userId)")
		return either {
			val game = findGame(gameId).bind()
			validate(userId, game).bind()
			addPlayer(game, userId)
		}
	}


	private suspend fun findGame(gameId: String): Either<GameNotFoundError, GameEntity> {
		return queryGame.execute(gameId).mapLeft { GameNotFoundError }
	}


	private suspend fun validate(userId: String, game: GameEntity): Either<UserAlreadyPlayer, Unit> {
		if (existsPlayer(userId, game)) {
			return UserAlreadyPlayer.left()
		} else {
			return Unit.right()
		}
	}


	private suspend fun existsPlayer(userId: String, game: GameEntity): Boolean {
		val result = queryPlayer.execute(userId, game.id)
		return when (result) {
			is Either.Left -> when (result.value) {
				is EntityNotFoundError -> false
			}
			is Either.Right -> true
		}
	}


	private suspend fun addPlayer(game: GameEntity, userId: String) {
		val player = PlayerEntity(
			id = UUID.gen(),
			userId = userId,
			gameId = game.id,
			connectionId = null,
			state = PlayerEntity.STATE_PLAYING
		)
		return insertPlayer.execute(player)
			.getOrElse { throw Exception("Could not save new player (userId=$userId) for game ${game.id} ") }
	}

}