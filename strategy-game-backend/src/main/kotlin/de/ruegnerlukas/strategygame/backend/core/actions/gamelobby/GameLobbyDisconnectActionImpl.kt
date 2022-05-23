package de.ruegnerlukas.strategygame.backend.core.actions.gamelobby

import de.ruegnerlukas.strategygame.backend.ports.models.new.ConnectionState
import de.ruegnerlukas.strategygame.backend.ports.models.new.GameLobbyEntity
import de.ruegnerlukas.strategygame.backend.ports.models.new.PlayerConnectionEntity
import de.ruegnerlukas.strategygame.backend.ports.models.new.PlayerEntity
import de.ruegnerlukas.strategygame.backend.ports.provided.gamelobby.GameLobbyDisconnectAction
import de.ruegnerlukas.strategygame.backend.ports.required.GameRepository
import de.ruegnerlukas.strategygame.backend.shared.Logging
import de.ruegnerlukas.strategygame.backend.shared.Rail

class GameLobbyDisconnectActionImpl(private val repository: GameRepository) : GameLobbyDisconnectAction, Logging {

	override suspend fun perform(userId: String): Rail<Unit> {
		log().info("Disconnect user $userId from currently connected game-lobby")
		return Rail.begin()
			.flatMap("GAME_NOT_FOUND") { repository.getByUserId(userId) }
			.map { it.map { curr -> updateGameParticipant(userId, curr) } }
			.flatMap("FAILED_WRITE") { repository.save(it) }
			.discardValue()
	}

	private fun updateGameParticipant(userId: String, prev: GameLobbyEntity): GameLobbyEntity {
		return GameLobbyEntity(
			gameId = prev.gameId,
			participants = prev.participants.map {
				when (it.userId) {
					userId -> PlayerEntity(
						userId = it.userId,
						connection = PlayerConnectionEntity(
							state = ConnectionState.DISCONNECTED,
							connectionId = -1
						),
						state = it.state
					)
					else -> it
				}
			},
			world = prev.world,
			commands = prev.commands
		)
	}

}