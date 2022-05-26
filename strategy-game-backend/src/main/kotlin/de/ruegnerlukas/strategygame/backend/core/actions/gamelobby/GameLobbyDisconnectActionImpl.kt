package de.ruegnerlukas.strategygame.backend.core.actions.gamelobby

import de.ruegnerlukas.strategygame.backend.ports.errors.ApplicationError
import de.ruegnerlukas.strategygame.backend.ports.errors.EntityNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.errors.GameNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.models.gamelobby.Game
import de.ruegnerlukas.strategygame.backend.ports.models.gamelobby.PlayerConnectionEntity
import de.ruegnerlukas.strategygame.backend.ports.models.gamelobby.disconnected
import de.ruegnerlukas.strategygame.backend.ports.provided.gamelobby.GameLobbyDisconnectAction
import de.ruegnerlukas.strategygame.backend.ports.required.GameRepository
import de.ruegnerlukas.strategygame.backend.shared.either.Either
import de.ruegnerlukas.strategygame.backend.shared.Logging
import de.ruegnerlukas.strategygame.backend.shared.either.discardValue
import de.ruegnerlukas.strategygame.backend.shared.either.flatMap
import de.ruegnerlukas.strategygame.backend.shared.either.map
import de.ruegnerlukas.strategygame.backend.shared.either.mapError

class GameLobbyDisconnectActionImpl(private val repository: GameRepository) : GameLobbyDisconnectAction, Logging {

	override suspend fun perform(userId: String): Either<Unit, ApplicationError> {
		log().info("Disconnect user $userId from currently connected game-lobby")
		return repository.getByUserId(userId)
			.map { it.map { curr -> updateGameParticipant(userId, curr) } }
			.flatMap { repository.save(it) }
			.mapError(EntityNotFoundError) { GameNotFoundError }
			.discardValue()
	}

	private fun updateGameParticipant(userId: String, prev: Game): Game {
		return prev.copy(
			participants = prev.participants.map {
				if (it.userId == userId) {
					it.copy(connection = PlayerConnectionEntity.disconnected())
				} else {
					it
				}
			}
		)
	}

}