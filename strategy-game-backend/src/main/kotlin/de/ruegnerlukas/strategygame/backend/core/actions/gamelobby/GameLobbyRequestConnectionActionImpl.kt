package de.ruegnerlukas.strategygame.backend.core.actions.gamelobby

import de.ruegnerlukas.strategygame.backend.ports.errors.ApplicationError
import de.ruegnerlukas.strategygame.backend.ports.errors.EntityNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.errors.GameNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.errors.NotParticipantError
import de.ruegnerlukas.strategygame.backend.ports.models.new.GameLobbyEntity
import de.ruegnerlukas.strategygame.backend.ports.provided.gamelobby.GameLobbyRequestConnectionAction
import de.ruegnerlukas.strategygame.backend.ports.required.GameRepository
import de.ruegnerlukas.strategygame.backend.shared.Either
import de.ruegnerlukas.strategygame.backend.shared.Err
import de.ruegnerlukas.strategygame.backend.shared.Logging
import de.ruegnerlukas.strategygame.backend.shared.Ok
import de.ruegnerlukas.strategygame.backend.shared.flatMap
import de.ruegnerlukas.strategygame.backend.shared.mapError

class GameLobbyRequestConnectionActionImpl(private val repository: GameRepository) : GameLobbyRequestConnectionAction, Logging {

	override suspend fun perform(userId: String, gameId: String): Either<Unit, ApplicationError> {
		log().info("Request to connect to game-lobby $gameId from user $userId")
		return repository.get(gameId)
			.mapError(EntityNotFoundError) { GameNotFoundError }
			.flatMap { validateParticipant(userId, it) }
	}

	private fun validateParticipant(userId: String, gameLobby: GameLobbyEntity): Either<Unit, NotParticipantError> {
		val isParticipant = gameLobby.participants.map { it.userId }.contains(userId)
		return when {
			isParticipant -> Ok(Unit)
			else -> Err(NotParticipantError)
		}
	}

}