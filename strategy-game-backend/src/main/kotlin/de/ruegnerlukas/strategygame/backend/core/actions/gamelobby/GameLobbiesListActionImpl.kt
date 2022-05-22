package de.ruegnerlukas.strategygame.backend.core.actions.gamelobby

import de.ruegnerlukas.strategygame.backend.ports.provided.gamelobby.GameLobbiesListAction
import de.ruegnerlukas.strategygame.backend.ports.required.GameRepository
import de.ruegnerlukas.strategygame.backend.shared.Logging
import de.ruegnerlukas.strategygame.backend.shared.Rail

class GameLobbiesListActionImpl(private val repository: GameRepository) : GameLobbiesListAction, Logging {

	override suspend fun perform(userId: String): Rail<List<String>> {
		log().info("Listing all game-lobbies of user $userId")
		return Rail.begin()
			.flatMap { repository.getByUserId(userId) }
			.map { it.map { curr -> curr.gameId } }
	}

}