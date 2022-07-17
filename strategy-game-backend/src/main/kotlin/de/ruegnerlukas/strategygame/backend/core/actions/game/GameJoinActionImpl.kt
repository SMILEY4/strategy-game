package de.ruegnerlukas.strategygame.backend.core.actions.game

import arrow.core.Either
import arrow.core.computations.either
import arrow.core.left
import arrow.core.right
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CountryEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.PlayerEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.PlayerExtendedEntity
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameJoinAction
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameJoinAction.GameJoinActionErrors
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameJoinAction.GameNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameJoinAction.UserAlreadyPlayerError
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.InsertPlayerExtended
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.QueryGame
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.QueryPlayer
import de.ruegnerlukas.strategygame.backend.shared.Logging
import de.ruegnerlukas.strategygame.backend.shared.UUID

class GameJoinActionImpl(
	private val queryGame: QueryGame,
	private val queryPlayer: QueryPlayer,
	private val insertPlayerExtended: InsertPlayerExtended
) : GameJoinAction, Logging {

	override suspend fun perform(userId: String, gameId: String): Either<GameJoinActionErrors, Unit> {
		log().info("Joining game $gameId as user $userId)")
		return either {
			val game = findGame(gameId).bind()
			validate(game, userId).bind()
			addPlayer(game, userId)
		}
	}


	/**
	 * Find and return the game with the given id or an [GameNotFoundError] if the game does not exist
	 */
	private suspend fun findGame(gameId: String): Either<GameNotFoundError, GameEntity> {
		return queryGame.execute(gameId).mapLeft { GameNotFoundError }
	}


	/**
	 * Validate whether the given user can join the given game. Return nothing or an [UserAlreadyPlayerError]
	 */
	private suspend fun validate(game: GameEntity, userId: String): Either<UserAlreadyPlayerError, Unit> {
		val existsPlayer = when (queryPlayer.execute(userId, game.id)) {
			is Either.Right -> true
			is Either.Left -> false
		}
		if (existsPlayer) {
			return UserAlreadyPlayerError.left()
		} else {
			return Unit.right()
		}
	}


	/**
	 * Add the user as a player and all connected data (e.g. the country to play as) to the given game
	 */
	private suspend fun addPlayer(game: GameEntity, userId: String) {
		val playerId = UUID.gen()
		val countryId = UUID.gen()
		insertPlayerExtended.execute(
			PlayerExtendedEntity(
				player = PlayerEntity(
					id = playerId,
					userId = userId,
					gameId = game.id,
					connectionId = null,
					state = PlayerEntity.STATE_PLAYING,
					countryId = countryId
				),
				country = CountryEntity(
					id = countryId,
					worldId = game.worldId,
					amountMoney = 200f
				)
			)
		)
	}

}