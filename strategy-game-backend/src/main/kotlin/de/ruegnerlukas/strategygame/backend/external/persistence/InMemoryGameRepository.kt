package de.ruegnerlukas.strategygame.backend.external.persistence

import de.ruegnerlukas.strategygame.backend.ports.models.game.GameState
import de.ruegnerlukas.strategygame.backend.ports.required.GameRepository
import de.ruegnerlukas.strategygame.backend.shared.results.Result
import de.ruegnerlukas.strategygame.backend.shared.results.VoidResult

class InMemoryGameRepository : GameRepository {

	private val gameStates = mutableMapOf<String, GameState>()


	override fun saveGameState(state: GameState): VoidResult {
		gameStates[state.gameId] = state
		return VoidResult.success()
	}


	override fun getGameState(gameId: String): Result<GameState> {
		val state = gameStates[gameId]
		return if (state != null) {
			Result.success(state)
		} else {
			Result.error("GAME_NOT_FOUND:$gameId")
		}
	}


	override fun getGameStates(userId: String): Result<List<GameState>> {
		return Result.success(
			gameStates.values.filter { isParticipant(it, userId) }
		)
	}


	private fun isParticipant(gameState: GameState, userId: String): Boolean {
		return gameState.participants
			.map { it.userId }
			.contains(userId)
	}

}