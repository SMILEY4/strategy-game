package de.ruegnerlukas.strategygame.backend.core.actions.gamelobby

import de.ruegnerlukas.strategygame.backend.ports.errors.ApplicationError
import de.ruegnerlukas.strategygame.backend.ports.errors.EntityNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.errors.GameNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.provided.gamelobby.GameLobbyJoinAction
import de.ruegnerlukas.strategygame.backend.ports.required.Repository
import de.ruegnerlukas.strategygame.backend.shared.Logging
import de.ruegnerlukas.strategygame.backend.shared.either.Either
import de.ruegnerlukas.strategygame.backend.shared.either.discardValue
import de.ruegnerlukas.strategygame.backend.shared.either.flatMap
import de.ruegnerlukas.strategygame.backend.shared.either.mapError

/**
 * Join an existing game-lobby
 */
class GameLobbyJoinActionImpl(private val repository: Repository) : GameLobbyJoinAction, Logging {

	override suspend fun perform(userId: String, gameId: String): Either<Unit, ApplicationError> {
		log().info("Join game-lobby $gameId (user = $userId)")
		return Either.start()
			.flatMap { repository.getGame(gameId) }
			.flatMap { repository.insertParticipant(gameId, userId) }
			.mapError(EntityNotFoundError) { GameNotFoundError }
			.discardValue()
	}

}