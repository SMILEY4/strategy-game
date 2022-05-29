package de.ruegnerlukas.strategygame.backend.core.actions.gamelobby

import de.ruegnerlukas.strategygame.backend.ports.errors.ApplicationError
import de.ruegnerlukas.strategygame.backend.ports.errors.EntityNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.errors.GameNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.models.gamelobby.Game
import de.ruegnerlukas.strategygame.backend.ports.models.gamelobby.PlayerEntity
import de.ruegnerlukas.strategygame.backend.ports.provided.gamelobby.GameLobbyJoinAction
import de.ruegnerlukas.strategygame.backend.ports.required.GameRepository
import de.ruegnerlukas.strategygame.backend.shared.either.Either
import de.ruegnerlukas.strategygame.backend.shared.Logging
import de.ruegnerlukas.strategygame.backend.shared.either.discardValue
import de.ruegnerlukas.strategygame.backend.shared.either.flatMap
import de.ruegnerlukas.strategygame.backend.shared.either.map
import de.ruegnerlukas.strategygame.backend.shared.either.mapError

/**
 * Join an existing game-lobby
 */
class GameLobbyJoinActionImpl(private val repository: GameRepository) : GameLobbyJoinAction, Logging {

	override suspend fun perform(userId: String, gameId: String): Either<Unit, ApplicationError> {
		log().info("Join game-lobby $gameId (user = $userId)")
		return repository.get(gameId)
			.map { addParticipant(userId, it) }
			.flatMap { repository.save(it) }
			.mapError(EntityNotFoundError) { GameNotFoundError }
			.discardValue()
	}

	private fun addParticipant(userId: String, prev: Game): Game {
		if (prev.participants.map { it.userId }.contains(userId)) {
			return prev
		} else {
			return prev.copy(participants = prev.participants + listOf(PlayerEntity.of(userId)))
		}

	}

}