package de.ruegnerlukas.strategygame.backend.core.actions.gamelobby

import de.ruegnerlukas.strategygame.backend.ports.provided.gamelobby.ListPlayerGameLobbiesAction
import de.ruegnerlukas.strategygame.backend.ports.required.GameRepository
import de.ruegnerlukas.strategygame.backend.shared.results.Result

class ListPlayerGameLobbiesActionImpl(private val gameRepository: GameRepository) : ListPlayerGameLobbiesAction {

	override fun perform(userId: String): Result<List<String>> {
		return Result.success(
			gameRepository.getGameStates(userId).getOr(listOf()).map { it.gameId }
		)
	}

}