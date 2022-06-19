package de.ruegnerlukas.strategygame.backend.core.actions.gamelobby

import de.ruegnerlukas.strategygame.backend.ports.errors.ApplicationError
import de.ruegnerlukas.strategygame.backend.ports.errors.EntityNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.errors.GameNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.errors.NotParticipantError
import de.ruegnerlukas.strategygame.backend.ports.models.gamelobby.Game
import de.ruegnerlukas.strategygame.backend.ports.provided.gamelobby.GameLobbyRequestConnectionAction
import de.ruegnerlukas.strategygame.backend.ports.required.OldGameRepository
import de.ruegnerlukas.strategygame.backend.shared.either.Either
import de.ruegnerlukas.strategygame.backend.shared.either.Err
import de.ruegnerlukas.strategygame.backend.shared.Logging
import de.ruegnerlukas.strategygame.backend.shared.either.Ok
import de.ruegnerlukas.strategygame.backend.shared.either.flatMap
import de.ruegnerlukas.strategygame.backend.shared.either.mapError

class GameLobbyRequestConnectionActionImpl(private val repository: OldGameRepository) : GameLobbyRequestConnectionAction, Logging {

	override suspend fun perform(userId: String, gameId: String): Either<Unit, ApplicationError> {
		log().info("Request to connect to game-lobby $gameId from user $userId")
		return repository.get(gameId)
			.mapError(EntityNotFoundError) { GameNotFoundError }
			.flatMap { validateParticipant(userId, it) }
	}

	private fun validateParticipant(userId: String, game: Game): Either<Unit, NotParticipantError> {
		val isParticipant = game.participants.map { it.userId }.contains(userId)
		return when {
			isParticipant -> Ok(Unit)
			else -> Err(NotParticipantError)
		}
	}

}