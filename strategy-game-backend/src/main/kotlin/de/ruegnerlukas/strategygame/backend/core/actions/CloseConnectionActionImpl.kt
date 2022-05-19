package de.ruegnerlukas.strategygame.backend.core.actions

import de.ruegnerlukas.strategygame.backend.ports.provided.CloseConnectionAction
import de.ruegnerlukas.strategygame.backend.ports.required.GameRepository
import de.ruegnerlukas.strategygame.backend.shared.Logging

class CloseConnectionActionImpl(private val repository: GameRepository) : CloseConnectionAction, Logging {

	override suspend fun perform(userId: String) {
		repository.getGameStates(userId).getUnsafe()?.forEach { gameState ->
			gameState.participants.find { it.userId == userId }?.let { participant ->
				participant.connectionId = null
				participant.currentCommands = null
			}
		}
	}

}