package de.ruegnerlukas.strategygame.backend.core.actions.game

import arrow.core.Either
import arrow.core.continuations.either
import arrow.core.left
import arrow.core.right
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CountryEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CountryResourcesEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.PlayerEntity
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameJoinAction
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameJoinAction.GameJoinActionErrors
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameJoinAction.GameNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameJoinAction.UserAlreadyPlayerError
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.InsertCountry
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.QueryGame
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.UpdateGame
import de.ruegnerlukas.strategygame.backend.shared.Logging

class GameJoinActionImpl(
	private val queryGame: QueryGame,
	private val updateGame: UpdateGame,
	private val insertCountry: InsertCountry
) : GameJoinAction, Logging {

	override suspend fun perform(userId: String, gameId: String): Either<GameJoinActionErrors, Unit> {
		log().info("Joining game $gameId as user $userId)")
		return either {
			val game = findGame(gameId).bind()
			validate(game, userId).bind()
			insertPlayer(game, userId)
			insertCountry(game, userId)
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
	private fun validate(game: GameEntity, userId: String): Either<UserAlreadyPlayerError, Unit> {
		val existsPlayer = game.players.map { it.userId }.contains(userId)
		if (existsPlayer) {
			return UserAlreadyPlayerError.left()
		} else {
			return Unit.right()
		}
	}


	/**
	 * Add the user as a player to the given game
	 */
	private suspend fun insertPlayer(game: GameEntity, userId: String) {
		game.players.add(
			PlayerEntity(
				userId = userId,
				connectionId = null,
				state = PlayerEntity.STATE_PLAYING,
			)
		)
		updateGame.execute(game)
	}


	/**
	 * Add the country for the given user to the given game
	 */
	private suspend fun insertCountry(game: GameEntity, userId: String) {
		insertCountry.execute(
			CountryEntity(
				gameId = game.id!!,
				userId = userId,
				resources = CountryResourcesEntity(
					money = 200f
				)
			)
		)
	}

}