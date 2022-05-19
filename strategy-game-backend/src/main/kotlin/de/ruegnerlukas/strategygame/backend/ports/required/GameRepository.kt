package de.ruegnerlukas.strategygame.backend.ports.required

import de.ruegnerlukas.strategygame.backend.ports.models.game.GameState
import de.ruegnerlukas.strategygame.backend.shared.results.Result
import de.ruegnerlukas.strategygame.backend.shared.results.VoidResult

interface GameRepository {

	/**
	 * Persist the given [GameState]
	 */
	fun saveGameState(state: GameState): VoidResult


	/**
	 * Fetch a [GameState] by its [GameState.gameId]
	 * @return a success-result or an error-result with the error "GAME_NOT_FOUND:<gameId>"
	 */
	fun getGameState(gameId: String): Result<GameState>


	/**
	 * Fetch all [GameState] where the given user is a participant
	 */
	fun getGameStates(userId: String): Result<List<GameState>>

}