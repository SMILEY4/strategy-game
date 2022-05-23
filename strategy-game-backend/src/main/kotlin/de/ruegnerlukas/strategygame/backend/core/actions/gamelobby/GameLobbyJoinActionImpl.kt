package de.ruegnerlukas.strategygame.backend.core.actions.gamelobby

import de.ruegnerlukas.strategygame.backend.ports.models.new.GameLobbyEntity
import de.ruegnerlukas.strategygame.backend.ports.models.new.PlayerEntity
import de.ruegnerlukas.strategygame.backend.ports.models.new.of
import de.ruegnerlukas.strategygame.backend.ports.provided.gamelobby.GameLobbyJoinAction
import de.ruegnerlukas.strategygame.backend.ports.required.GameRepository
import de.ruegnerlukas.strategygame.backend.shared.Logging
import de.ruegnerlukas.strategygame.backend.shared.Rail

/**
 * Join an existing game-lobby
 */
class GameLobbyJoinActionImpl(private val repository: GameRepository) : GameLobbyJoinAction, Logging {

	override suspend fun perform(userId: String, gameId: String): Rail<Unit> {
		log().info("Join game-lobby $gameId (user = $userId)")
		return Rail.begin()
			.flatMap("GAME_NOT_FOUND") { repository.get(gameId) }
			.map { addParticipant(userId, it) }
			.flatMap("FAILED_WRITE") { repository.save(it) }
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