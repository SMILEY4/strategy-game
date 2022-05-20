package de.ruegnerlukas.strategygame.backend.core.actions

import de.ruegnerlukas.strategygame.backend.ports.models.game.GameState
import de.ruegnerlukas.strategygame.backend.ports.provided.ValidateConnectGameLobbyAction
import de.ruegnerlukas.strategygame.backend.ports.required.GameRepository
import de.ruegnerlukas.strategygame.backend.shared.results.VoidResult

class ValidateConnectGameLobbyActionImpl(private val gameRepository: GameRepository) : ValidateConnectGameLobbyAction {

	override fun perform(userId: String, gameId: String): VoidResult {
		val gameState = gameRepository.getGameState(gameId)
		if (gameState.isError()) {
			return gameState
		}
		if (!isParticipant(gameState.get(), userId)) {
			return VoidResult.error("NOT_PARTICIPANT")
		}
		return VoidResult.success()
	}

	private fun isParticipant(gameState: GameState, userId: String): Boolean {
		return gameState.participants
			.map { it.userId }
			.contains(userId)
	}

}