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
			Result.error("No game with the given game-id '$gameId'")
		}
	}

}