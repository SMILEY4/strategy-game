package de.ruegnerlukas.strategygame.backend.core.actions.gamelobby

import de.ruegnerlukas.strategygame.backend.ports.models.new.GameLobbyEntity
import de.ruegnerlukas.strategygame.backend.ports.provided.gamelobby.GameLobbyRequestConnectionAction
import de.ruegnerlukas.strategygame.backend.ports.required.GameRepository
import de.ruegnerlukas.strategygame.backend.shared.Logging
import de.ruegnerlukas.strategygame.backend.shared.Rail

class GameLobbyRequestConnectionActionImpl(private val repository: GameRepository) : GameLobbyRequestConnectionAction, Logging {

	override suspend fun perform(userId: String, gameId: String): Rail<Unit> {
		log().info("Request to join game-lobby $gameId from user $userId")
		return Rail.begin()
			.flatMap("GAME_NOT_FOUND") { repository.get(gameId) }
			.flatMap { validateParticipant(userId, it) }
	}

	private fun validateParticipant(userId: String, gameLobby: GameLobbyEntity): Rail<Unit> {
		val isParticipant = gameLobby.participants.map { it.userId }.contains(userId)
		return when {
			isParticipant -> Rail.success()
			else -> Rail.error("NOT_PARTICIPANT")
		}
	}

}