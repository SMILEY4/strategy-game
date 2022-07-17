package de.ruegnerlukas.strategygame.backend.ports.provided.game

import arrow.core.Either

/**
 * Join an existing game
 */
interface GameJoinAction {

	sealed class GameJoinActionErrors
	object UserAlreadyPlayer: GameJoinActionErrors()
	object GameNotFoundError: GameJoinActionErrors()

	suspend fun perform(userId: String, gameId: String): Either<GameJoinActionErrors, Unit>

}