package de.ruegnerlukas.strategygame.backend.ports.required

import de.ruegnerlukas.strategygame.backend.ports.models.game.GameState
import de.ruegnerlukas.strategygame.backend.shared.results.Result
import de.ruegnerlukas.strategygame.backend.shared.results.VoidResult

interface GameRepository {

	/**
	 * Save or update the given game-state. The unique id is the [GameState.gameId]
	 */
	fun saveGameState(state: GameState): VoidResult


	/**
	 * Get a game-state by the game-id
	 */
	fun getGameState(gameId: String): Result<GameState>


	/**
	 * Get all game-states where the user with the given id is participating
	 */
	fun getGameStates(userId: String): Result<List<GameState>>

}