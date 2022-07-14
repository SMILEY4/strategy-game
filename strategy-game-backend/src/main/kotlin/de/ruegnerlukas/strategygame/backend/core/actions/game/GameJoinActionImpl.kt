package de.ruegnerlukas.strategygame.backend.core.actions.game

import arrow.core.Either
import arrow.core.computations.either
import arrow.core.handleErrorWith
import de.ruegnerlukas.strategygame.backend.ports.errors.ApplicationError
import de.ruegnerlukas.strategygame.backend.ports.errors.EntityNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.errors.GameNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.errors.UserAlreadyPlayer
import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.PlayerEntity
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameJoinAction
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.game.GameQuery
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.player.PlayerInsert
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.player.PlayerQueryByUserAndGame
import de.ruegnerlukas.strategygame.backend.shared.Logging
import de.ruegnerlukas.strategygame.backend.shared.UUID

/**
 * Join an existing game-lobby
 */
class GameJoinActionImpl(
	private val queryGame: GameQuery,
	private val insertPlayer: PlayerInsert,
	private val queryPlayer: PlayerQueryByUserAndGame
) : GameJoinAction, Logging {

	override suspend fun perform(userId: String, gameId: String): Either<ApplicationError, Unit> {
		log().info("Join game-lobby $gameId (user = $userId)")
		return either<ApplicationError, Unit> {
			val game = queryGame.execute(gameId).mapLeft { GameNotFoundError }.bind()
			validate(userId, game).bind()
			insertPlayer.execute(createPlayer(game.id, userId)).bind()
		}.handleErrorWith { e ->
			when (e) {
				is UserAlreadyPlayer -> Either.Right("").void()
				else -> Either.Left(e)
			}
		}
	}

	private suspend fun validate(userId: String, game: GameEntity): Either<ApplicationError, Unit> {
		val result = queryPlayer.execute(userId, game.id)
		return result.fold(
			{ e ->
				when (e) {
					is EntityNotFoundError -> Either.Right("").void()
					else -> Either.Left(e)
				}
			},
			{ Either.Left(UserAlreadyPlayer) }
		)
	}

	private fun createPlayer(gameId: String, userId: String) = PlayerEntity(
		id = UUID.gen(),
		userId = userId,
		gameId = gameId,
		connectionId = null,
		state = PlayerEntity.STATE_PLAYING
	)

}