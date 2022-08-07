package de.ruegnerlukas.strategygame.backend.core.actions.game

import de.ruegnerlukas.strategygame.backend.ports.provided.game.GamesListAction
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.GamesByUserQuery
import de.ruegnerlukas.strategygame.backend.shared.Logging

class GamesListActionImpl(
	private val gamesByUserQuery: GamesByUserQuery
) : GamesListAction, Logging {

	override suspend fun perform(userId: String): List<String> {
		log().info("Listing all game-ids of user $userId")
		return getGameIds(userId)
	}

	/**
	 * Find all games with the given user as a player and return the ids
	 */
	private suspend fun getGameIds(userId: String): List<String> {
		return gamesByUserQuery.execute(userId).map { it.id!! }
	}

}