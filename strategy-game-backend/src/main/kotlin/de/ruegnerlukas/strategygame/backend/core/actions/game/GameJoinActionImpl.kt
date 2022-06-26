package de.ruegnerlukas.strategygame.backend.core.actions.game

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
import de.ruegnerlukas.strategygame.backend.shared.either.Either
import de.ruegnerlukas.strategygame.backend.shared.either.Err
import de.ruegnerlukas.strategygame.backend.shared.either.Ok
import de.ruegnerlukas.strategygame.backend.shared.either.discardValue
import de.ruegnerlukas.strategygame.backend.shared.either.flatMap
import de.ruegnerlukas.strategygame.backend.shared.either.getError
import de.ruegnerlukas.strategygame.backend.shared.either.mapError
import de.ruegnerlukas.strategygame.backend.shared.either.recover
import de.ruegnerlukas.strategygame.backend.shared.either.thenOrErr

/**
 * Join an existing game-lobby
 */
class GameJoinActionImpl(
	private val queryGame: GameQuery,
	private val insertPlayer: PlayerInsert,
	private val queryPlayer: PlayerQueryByUserAndGame
) : GameJoinAction, Logging {

	override suspend fun perform(userId: String, gameId: String): Either<Unit, ApplicationError> {
		log().info("Join game-lobby $gameId (user = $userId)")
		return Either.start()
			.flatMap { queryGame.execute(gameId) }
			.mapError(EntityNotFoundError) { GameNotFoundError }
			.thenOrErr { game -> validate(userId, game) }
			.flatMap { game -> insertPlayer.execute(createPlayer(game.id, userId)) }
			.recover(UserAlreadyPlayer) { }
			.discardValue()
	}


	private suspend fun validate(userId: String, game: GameEntity): Either<Unit, ApplicationError> {
		val result = queryPlayer.execute(userId, game.id)
		return when {
			result.isOk() -> Err(UserAlreadyPlayer)
			result.isError(EntityNotFoundError) -> Ok()
			else -> Err(result.getError()!!)
		}
	}

	private fun createPlayer(gameId: String, userId: String) = PlayerEntity(
		id = UUID.gen(),
		userId = userId,
		gameId = gameId,
		connectionId = null,
		state = PlayerEntity.STATE_PLAYING
	)

}