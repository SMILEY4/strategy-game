package de.ruegnerlukas.strategygame.backend.core.actions.gamelobby

import de.ruegnerlukas.strategygame.backend.ports.errors.ApplicationError
import de.ruegnerlukas.strategygame.backend.ports.errors.EntityNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.errors.GameNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.models.game.GameLobbyEntity
import de.ruegnerlukas.strategygame.backend.ports.models.game.PlayerEntity
import de.ruegnerlukas.strategygame.backend.ports.models.game.of
import de.ruegnerlukas.strategygame.backend.ports.provided.gamelobby.GameLobbyJoinAction
import de.ruegnerlukas.strategygame.backend.ports.required.GameRepository
import de.ruegnerlukas.strategygame.backend.shared.Either
import de.ruegnerlukas.strategygame.backend.shared.Logging
import de.ruegnerlukas.strategygame.backend.shared.discardValue
import de.ruegnerlukas.strategygame.backend.shared.flatMap
import de.ruegnerlukas.strategygame.backend.shared.map
import de.ruegnerlukas.strategygame.backend.shared.mapError

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

	private fun addParticipant(userId: String, prev: GameLobbyEntity): GameLobbyEntity {
		if (prev.participants.map { it.userId }.contains(userId)) {
			return prev
		} else {
			return GameLobbyEntity(
				gameId = prev.gameId,
				participants = prev.participants + listOf(PlayerEntity.of(userId)),
				world = prev.world,
				commands = prev.commands
			)
		}

	}

}