package de.ruegnerlukas.strategygame.backend.ports.required

import de.ruegnerlukas.strategygame.backend.ports.models.game.GameState
import de.ruegnerlukas.strategygame.backend.shared.results.VoidResult
import de.ruegnerlukas.strategygame.backend.shared.results.Result

interface GameRepository {

	fun saveGameState(state: GameState): VoidResult

	fun getGameState(gameId: String): Result<GameState>

}